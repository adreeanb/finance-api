import { prisma } from '../../lib/prisma';
import { GeminiService } from '../finance-ai/GeminiService';

export interface WebhookPayload {
  chatId: string;
  message: string;
  fromMe?: boolean;
  pushName?: string;
  payload_id?: string;
  event?: string;
  session?: string;
}

export class WhatsAppBotService {
  private geminiService = new GeminiService();

  private async getDefaultCategory(userId: string) {
    let cat = await prisma.category.findFirst({ where: { userId } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name: '📱 Lançado via WhatsApp', userId } });
    }
    return cat.id;
  }

  async processarMensagem(payload: WebhookPayload) {
    // Blindagem de segurança
    const data = Array.isArray(payload) ? payload[0] : payload;

    if (!data || !data.chatId || !data.message) {
      console.error("Payload inválido recebido do n8n:", payload);
      return "";
    }

    // 🛡️ VALIDAÇÃO ANTI-LOOP: Se a mensagem contiver "BOT FINANCEIRO", o fluxo é descartado
    if (data.message.toUpperCase().includes("BOT FINANCEIRO")) {
      console.log("🔄 Mensagem do bot detectada e descartada para evitar loop.");
      return ""; // Retorna vazio para indicar que deve ser ignorado
    }

    let telefoneRemetente = "";

    if (data.chatId.endsWith('@g.us')) {
      // Cenário A: A mensagem foi enviada dentro de um GRUPO
      if (data.fromMe) {
        // Se fromMe for true, significa que foi VOCÊ (o dono do celular conectado) quem mandou
        telefoneRemetente = "5549991039622"; 
      } else if (data.senderId) {
        // Se foi a outra pessoa no grupo, extraímos o número dela limpando o sufixo (ex: @s.whatsapp.net)
        telefoneRemetente = data.senderId.split("@")[0].split(":")[0];
      }
    } else {
      // Cenário B: Chat Privado (o próprio chatId já é o número da pessoa)
      telefoneRemetente = data.chatId.split("@")[0];
    }

    // (Opcional) Trava de segurança para apenas vocês dois usarem o bot
    const numerosPermitidos = ["5549991039622", "5549922222"];
    if (!numerosPermitidos.includes(telefoneRemetente)) {
      console.log(`Tentativa de uso por número não autorizado: ${telefoneRemetente}`);
      return ""; // Ignora a mensagem de desconhecidos
    }

    // Busca no banco de dados EXATAMENTE o usuário que mandou a mensagem
    const user = await prisma.user.findFirst({
      where: { phone: telefoneRemetente },
    });

    if (!user) {
      return `BOT FINANCEIRO\n\n⚠️ Usuário não encontrado no sistema para o número ${telefoneRemetente}.`;
    }

    // 2. Interpreta com IA usando a mensagem limpa vinda do payload
    const dados = await this.geminiService.interpretarMensagem(data.message);
    const categoryId = await this.getDefaultCategory(user.id);
    let resposta = "";

    // 3. Roteamento de Intenções
    switch (dados.intent) {
      case 'LANCAMENTO':
        if (dados.parcelado && dados.numeroParcelas > 1) {
          const installmentValue = Number((dados.valor / dados.numeroParcelas).toFixed(2));
          await prisma.installment.create({
            data: {
              description: dados.descricao,
              totalAmount: dados.valor,
              totalInstallments: dados.numeroParcelas,
              installmentValue,
              startDate: new Date(),
              categoryId,
              userId: user.id
            }
          });
          resposta = `💳 Compra parcelada registrada: *${dados.descricao}* em ${dados.numeroParcelas}x de R$ ${installmentValue}`;
        } else {
          await prisma.transaction.create({
            data: {
              description: dados.descricao,
              amount: dados.valor,
              type: dados.transacao === 'gasto' ? 'EXPENSE' : 'INCOME',
              date: new Date(),
              categoryId,
              userId: user.id
            }
          });
          resposta = `✅ Lançamento registrado: *${dados.descricao}* (R$ ${dados.valor.toFixed(2)})`;
        }
        break;

      case 'GASTO_FIXO':
        await prisma.fixedExpense.create({
          data: {
            description: dados.descricao,
            amount: dados.valor,
            dueDate: dados.diaVencimento || 1,
            isActive: true,
            categoryId,
            userId: user.id
          }
        });
        resposta = `📌 Conta Fixa adicionada: *${dados.descricao}* - R$ ${dados.valor.toFixed(2)}/mês`;
        break;

      case 'RELATORIO':
      case 'RECOMENDACAO':
        const resumo = await this.gerarResumoDoMesAtual(user);
        
        if (dados.intent === 'RELATORIO') {
          resposta = `📊 *Resumo de ${resumo.mesAtual}*\n\n` +
                     `💵 Orçamento Total: R$ ${resumo.totalIncome.toFixed(2)}\n` +
                     `🔴 Despesas Totais: R$ ${resumo.totalExpense.toFixed(2)}\n` +
                     `🟢 Saldo Livre: R$ ${resumo.balance.toFixed(2)}\n\n` +
                     `⚠️ Comprometido: *${resumo.expensePercentage.toFixed(1)}%*`;
        } else {
            resposta = (await this.geminiService.gerarRecomendacaoIA(resumo)) ||
              "Desculpe, não consegui gerar uma recomendação no momento.";
        }
        break;

      default:
        resposta = "Desculpe, não consegui interpretar o seu comando. Pode tentar explicar de outra forma?";
    }

    // 4. Verificação de Alerta Rápido
    if (['LANCAMENTO', 'GASTO_FIXO'].includes(dados.intent)) {
      const resumoAtualizado = await this.gerarResumoDoMesAtual(user);
      if (resumoAtualizado.expensePercentage >= 80) {
        resposta += `\n\n🚨 *Atenção:* Seus gastos já consumiram ${resumoAtualizado.expensePercentage.toFixed(1)}% do seu limite este mês!`;
      }
    }

    // Retorna a resposta sempre precedida pela assinatura do bot
    return `BOT FINANCEIRO\n\n${resposta}`;
  }

  private async gerarResumoDoMesAtual(user: any) {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    const mesSelecionado = `${ano}-${String(mes).padStart(2, '0')}`;

    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0, 23, 59, 59);

    const transacoes = await prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: startDate, lte: endDate } }
    });

    const parcelamentos = await prisma.installment.findMany({
      where: { userId: user.id }
    });

    const fixos = await prisma.fixedExpense.findMany({
      where: { userId: user.id, isActive: true }
    });

    let totalIncome = Number(user.salary);
    let totalExpense = 0;

    transacoes.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') totalIncome += amount;
      else totalExpense += amount;
    });

    parcelamentos.forEach(inst => {
      const startD = new Date(inst.startDate);
      const startYear = startD.getUTCFullYear();
      const startMonth = startD.getUTCMonth() + 1;
      
      const monthDiff = (ano - startYear) * 12 + (mes - startMonth);
      if (monthDiff >= 0 && monthDiff < inst.totalInstallments) {
        totalExpense += Number(inst.installmentValue);
      }
    });

    fixos.forEach(f => {
      totalExpense += Number(f.amount);
    });

    const balance = totalIncome - totalExpense;
    const expensePercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

    return {
      nome: user.name,
      mesAtual: mesSelecionado,
      totalIncome,
      totalExpense,
      balance,
      expensePercentage
    };
  }
}