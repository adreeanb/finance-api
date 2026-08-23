import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent, 
  Calendar, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  PlusCircle,
  CreditCard,
  Repeat,
  PieChart 
} from 'lucide-react';
import { useTransactions } from '../hooks/useTransaction';
import { useInstallments } from '../hooks/useInstallments';
import { NewTransactionModal } from '../components/NewTransactionModal';
import { useUser } from '../hooks/useUser';
import { useFixedExpenses } from '../hooks/useFixedExpenses';
import { ChatWidget } from '../components/ChatWidget';

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pega a data atual e avança 1 mês para ser o padrão (Mês Seguinte)
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  const currentYear = now.getFullYear();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const currentDateString = `${currentYear}-${currentMonthNum}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentDateString);

  const { data: transactions, isLoading: isLoadingTx } = useTransactions();
  const { data: installments } = useInstallments();
  const { data: user } = useUser();
  const { data: fixedExpenses } = useFixedExpenses();

  // 1. Transações simples do mês selecionado
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => {
      const dateStr = t.date || t.createdAt;
      const transactionMonth = dateStr ? dateStr.slice(0, 7) : '';
      return transactionMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // 2. Parcelamentos ativos projetados para o mês selecionado
  const activeInstallments = useMemo(() => {
    if (!installments) return [];

    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);

    return installments
      .map((inst) => {
        const startDate = new Date(inst.startDate);
        const startYear = startDate.getUTCFullYear();
        const startMonth = startDate.getUTCMonth() + 1;

        const monthDiff = (selectedYear - startYear) * 12 + (selectedMonthNum - startMonth);

        if (monthDiff >= 0 && monthDiff < inst.totalInstallments) {
          return {
            ...inst,
            currentParcel: monthDiff + 1,
          };
        }
        return null;
      })
      .filter(Boolean) as (typeof installments[0] & { currentParcel: number })[];
  }, [installments, selectedMonth]);

  // 3. Gastos Fixos Ativos
  const activeFixedExpenses = useMemo(() => {
    if (!fixedExpenses) return [];
    return fixedExpenses.filter((fixed) => fixed.isActive);
  }, [fixedExpenses]);

  // 4. Cálculo Unificado das Métricas
  const metrics = useMemo(() => {
    const salary = Number(user?.salary) || 0;

    let totalIncome = salary;
    let totalExpense = 0;

    filteredTransactions.forEach((t) => {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    });

    activeInstallments.forEach((inst) => {
      totalExpense += Number(inst.installmentValue);
    });
    
    activeFixedExpenses.forEach((fixed) => {
      totalExpense += Number(fixed.amount);
    });

    const balance = totalIncome - totalExpense;
    const rawPercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      expensePercentage: Math.min(rawPercentage, 100),
    };
  }, [filteredTransactions, activeInstallments, activeFixedExpenses, user]);

  // 5. Cálculo do Top 3 Categorias de Despesas
  const topCategories = useMemo(() => {
    if (metrics.totalExpense === 0) return [];

    type CategoryLike = {
      name?: string | null;
    } | null | undefined;

    const categoryTotals: Record<string, { name: string; amount: number }> = {};

    const addExpense = (category: CategoryLike, amount: number) => {
      const name = category?.name || 'Outros';
      if (!categoryTotals[name]) {
        categoryTotals[name] = { name, amount: 0 };
      }
      categoryTotals[name].amount += amount;
    };

    filteredTransactions.forEach((t) => {
      if (t.type === 'EXPENSE') addExpense((t as { category?: CategoryLike }).category, Number(t.amount));
    });

    activeInstallments.forEach((inst) => {
      addExpense(inst.category, Number(inst.installmentValue));
    });

    activeFixedExpenses.forEach((fixed) => {
      addExpense(fixed.category, Number(fixed.amount));
    });

    return Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
      .map((cat) => ({
        ...cat,
        percentage: (cat.amount / metrics.totalExpense) * 100,
      }));
  }, [filteredTransactions, activeInstallments, activeFixedExpenses, metrics.totalExpense]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const monthOptions = useMemo(() => {
    const uniqueMonths = new Set<string>();

    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      uniqueMonths.add(`${year}-${month}`);
      date.setMonth(date.getMonth() - 1);
    }

    if (transactions) {
      transactions.forEach(t => {
        const dateStr = t.date || t.createdAt;
        if (dateStr) uniqueMonths.add(dateStr.slice(0, 7));
      });
    }

    if (installments) {
      installments.forEach(inst => {
        const startDate = new Date(inst.startDate);
        const startYear = startDate.getUTCFullYear();
        const startMonth = startDate.getUTCMonth(); 

        for (let i = 0; i < inst.totalInstallments; i++) {
          const currentM = startMonth + i;
          const y = startYear + Math.floor(currentM / 12);
          const m = (currentM % 12) + 1;
          uniqueMonths.add(`${y}-${String(m).padStart(2, '0')}`);
        }
      });
    }

    const sortedMonths = Array.from(uniqueMonths).sort((a, b) => b.localeCompare(a));

    return sortedMonths.map(value => {
      const [y, m] = value.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, 1);
      const label = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
    });
  }, [transactions, installments]); 

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Filtro do Mês */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Ciclo / Mês de Referência:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-medium">Receitas</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalIncome)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-medium">Despesas Totais</span>
            <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalExpense)}</h3>
          <p className="text-xs text-gray-400 mt-1">À vista + Parcelas + Fixos</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-medium">Saldo / Excedente</span>
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${metrics.balance >= 0 ? 'text-gray-900' : 'text-rose-600'}`}>
            {formatCurrency(metrics.balance)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-medium">% de Comprometimento</span>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{metrics.expensePercentage.toFixed(1)}%</h3>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.expensePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 3 Categorias */}
      {topCategories.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold">Top 3 Maiores Despesas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCategories.map((cat, index) => {
              const colors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500'];
              const barColor = colors[index] || 'bg-indigo-500';

              return (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-gray-700 text-sm truncate pr-2">
                      {index + 1}º {cat.name}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex-1">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-500 w-10 text-right">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detalhamento do Ciclo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-800">Detalhamento do Ciclo Selecionado</h2>

        {/* Gastos Fixos Ativos */}
        {activeFixedExpenses.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-indigo-600" />
              Gastos Fixos Mensais
            </h3>
            <div className="space-y-2">
              {activeFixedExpenses.map((fixed) => (
                <div key={fixed.id} className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-sm">
                  <div>
                    <span className="font-semibold text-gray-800 block">{fixed.description}</span>
                    <span className="text-xs text-indigo-600 font-medium">
                      {fixed.dueDate ? `Vencimento: Dia ${fixed.dueDate}` : 'Data variável'}
                    </span>
                  </div>
                  <span className="font-bold text-rose-600">- {formatCurrency(Number(fixed.amount))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parcelas de cartão para o mês */}
        {activeInstallments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1.5 mt-4">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Parcelas de Cartão para este Mês
            </h3>
            <div className="space-y-2">
              {activeInstallments.map((inst) => (
                <div key={inst.id} className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-sm">
                  <div>
                    <span className="font-semibold text-gray-800 block">{inst.description}</span>
                    <span className="text-xs text-indigo-600 font-medium">
                      Parcela {inst.currentParcel} de {inst.totalInstallments}
                    </span>
                  </div>
                  <span className="font-bold text-rose-600">- {formatCurrency(Number(inst.installmentValue))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transações à Vista */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 mt-4">Transações à Vista</h3>
          
          {isLoadingTx ? (
            <div className="text-center py-6 text-gray-500">Carregando...</div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Nenhuma transação à vista neste mês.</p>
          ) : (
            <>
              {/* VISÃO MOBILE: Lista de Cards */}
              <div className="block sm:hidden space-y-2">
                {filteredTransactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                    <div className="flex items-center gap-3">
                      {t.type === 'INCOME' ? (
                        <ArrowUpCircle className="text-emerald-500 w-8 h-8 shrink-0" />
                      ) : (
                        <ArrowDownCircle className="text-rose-500 w-8 h-8 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-gray-800 block">{t.description}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(t.date || t.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                      </div>
                    </div>
                    <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                ))}
              </div>

              {/* VISÃO DESKTOP: Tabela Tradicional */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-gray-400 text-xs uppercase font-semibold">
                      <th className="py-3">Descrição</th>
                      <th className="py-3">Valor</th>
                      <th className="py-3">Tipo</th>
                      <th className="py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="py-4 flex items-center gap-2 font-medium text-gray-800">
                          {t.type === 'INCOME' ? (
                            <ArrowUpCircle className="text-emerald-500 w-5 h-5" />
                          ) : (
                            <ArrowDownCircle className="text-rose-500 w-5 h-5" />
                          )}
                          {t.description}
                        </td>
                        <td className={`py-4 font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(Number(t.amount))}
                        </td>
                        <td className="py-4 text-gray-500">{t.type === 'INCOME' ? 'Receita' : 'Despesa'}</td>
                        <td className="py-4 text-gray-400">
                          {new Date(t.date || t.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal e Chat */}
      <NewTransactionModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
      <ChatWidget />
    </main>
  );
}