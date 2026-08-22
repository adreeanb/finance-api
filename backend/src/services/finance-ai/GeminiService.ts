import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiService {
  async interpretarMensagem(textoUsuario: string) {
    const prompt = `
    Você é um processador de dados financeiros. Analise a mensagem do usuário e retorne EXCLUSIVAMENTE um objeto JSON puro e minificado, sem formatação Markdown e sem crases.
    
    Identifique a INTENÇÃO (intent) da mensagem entre estas opções:
    - "LANCAMENTO": Para gastos casuais, compras (à vista ou parceladas) e ganhos de dinheiro extras.
    - "GASTO_FIXO": Quando o usuário quer cadastrar uma conta recorrente/fixa nova (ex: "Aluguel 1200 todo dia 5").
    - "RELATORIO": Quando o usuário pergunta sobre saldos, gastos do mês ou pede um resumo.
    - "RECOMENDACAO": Quando o usuário pede conselhos financeiros ou um puxão de orelha.

    Formato do JSON de resposta esperado:
    {
      "intent": "LANCAMENTO" | "GASTO_FIXO" | "RELATORIO" | "RECOMENDACAO",
      "transacao": "gasto" | "saldo",
      "descricao": "Nome do item ou gasto",
      "valor": número decimal positivo ou 0,
      "tipoTransacao": "Débito" | "Crédito" | "Pix" | "Dinheiro",
      "parcelado": boolean,
      "numeroParcelas": número inteiro (1 se não for parcelado),
      "diaVencimento": número do dia do mês (para GASTO_FIXO se houver, senão null)
    }

    Mensagem do usuário: "${textoUsuario}"
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const rawText = response.text || '{}';
      
      // Regex cirúrgica: extrai apenas o que está dentro da primeira chave '{' até a última '}'
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("A IA não retornou um formato JSON válido.");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Erro no Gemini:", error);
      throw new Error("Falha ao interpretar mensagem com IA.");
    }
  }

  async gerarRecomendacaoIA(resumoFinanceiro: any) {
    const prompt = `
    Você é um consultor financeiro pessoal direto e pragmático.
    Avalie os seguintes dados de ${resumoFinanceiro.nome} no mês de ${resumoFinanceiro.mesAtual}:
    
    - Orçamento Total (Salário + Rendas Extras): R$ ${resumoFinanceiro.totalIncome.toFixed(2)}
    - Gastos do Mês (À vista + Parcelas + Fixos): R$ ${resumoFinanceiro.totalExpense.toFixed(2)}
    - Saldo Livre: R$ ${resumoFinanceiro.balance.toFixed(2)}
    - % da Renda Comprometida: ${resumoFinanceiro.expensePercentage.toFixed(1)}%
    
    Escreva um conselho curto em formato de WhatsApp (usando *, emojis). 
    Se a % comprometida for maior que 80%, dê um alerta severo. Se estiver positiva, elogie.
    Comece com "Análise do seu mês:"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text;
  }
}