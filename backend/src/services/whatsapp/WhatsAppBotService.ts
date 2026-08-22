import { prisma } from '../../lib/prisma.js';
import { GeminiService } from '../finance-ai/GeminiService.js';

export interface WebhookPayload {
  userId: string; // Mudou para aceitar o ID direto do usuário logado
  message: string;
}

export class WhatsAppBotService {
  private geminiService = new GeminiService();

  private async getDefaultCategory(userId: string) {
    let cat = await prisma.category.findFirst({ where: { userId } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name: '💬 Chat com IA', userId } });
    }
    return cat.id;
  }

  async processarMensagem(payload: WebhookPayload) {
    const { userId, message } = payload;

    if (!userId || !message) {
      console.error("Payload inválido recebido:", payload);
      return "Erro: Dados insuficientes para processar a mensagem.";
    }

    // 🛡️ VALIDAÇÃO ANTI-LOOP
    if (message.toUpperCase().includes("BOT FINANCEIRO")) {
      console.log("🔄 Mensagem do bot detectada e descartada.");
      return ""; 
    }

    // Busca o usuário diretamente pelo ID autenticado (JWT)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return "BOT FINANCEIRO\n\n⚠️ Usuário não encontrado no sistema.";
    }

    // Interpreta com IA
    const dados = await this.geminiService.interpretarMensagem(message);
    const categoryId = await this.getDefaultCategory(user.id);
    let resposta = "";

    // Roteamento de Intenções
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

    if (['LANCAMENTO', 'GASTO_FIXO'].includes(dados.intent)) {
      const resumoAtualizado = await this.gerarResumoDoMesAtual(user);
      if (resumoAtualizado.expensePercentage >= 80) {
        resposta += `\n\n🚨 *Atenção:* Seus gastos já consumiram ${resumoAtualizado.expensePercentage.toFixed(1)}% do seu limite este mês!`;
      }
    }

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

    let totalIncome = Number(user.salary || 0);
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