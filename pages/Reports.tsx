
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { Link } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TransactionType } from '../types';

const Reports: React.FC = () => {
  const { transactions } = useStore();
  const [timeframe, setTimeframe] = useState<'Día' | 'Mes' | 'Año'>('Mes');

  const {
    chartData,
    totalSales,
    totalExpenses,
    netProfit,
    topProducts,
    periodLabel,
    growth
  } = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let filteredTransactions = transactions;
    let chartData: any[] = [];
    let periodLabel = "";
    let previousPeriodSales = 100000; 

    if (timeframe === 'Día') {
      filteredTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getDate() === currentDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      periodLabel = "Hoy";
      const blocks = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
      chartData = blocks.map((block, index) => {
        const startHour = index * 4;
        const endHour = startHour + 4;
        const blockTrans = filteredTransactions.filter(t => {
          const h = new Date(t.date).getHours();
          return h >= startHour && h < endHour;
        });
        return {
          name: block,
          sales: blockTrans.filter(t => t.type === TransactionType.SALE).reduce((acc, t) => acc + t.amount, 0),
          expenses: blockTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0)
        };
      });
    } else if (timeframe === 'Mes') {
      filteredTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      periodLabel = "Este mes";
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
      chartData = weeks.map((week, index) => {
        const blockTrans = filteredTransactions.filter(t => {
          const d = new Date(t.date).getDate();
          return Math.ceil(d / 7) === (index + 1);
        });
        return {
          name: week,
          sales: blockTrans.filter(t => t.type === TransactionType.SALE).reduce((acc, t) => acc + t.amount, 0),
          expenses: blockTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0)
        };
      });
    } else if (timeframe === 'Año') {
      filteredTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === currentYear;
      });
      periodLabel = "Este año";
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      chartData = months.map((month, index) => {
        const blockTrans = filteredTransactions.filter(t => {
          return new Date(t.date).getMonth() === index;
        });
        return {
          name: month,
          sales: blockTrans.filter(t => t.type === TransactionType.SALE).reduce((acc, t) => acc + t.amount, 0),
          expenses: blockTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0)
        };
      });
    }

    const totalSales = filteredTransactions
        .filter(t => t.type === TransactionType.SALE)
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = filteredTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((acc, t) => acc + t.amount, 0);
    
    const netProfit = totalSales - totalExpenses;
    const growth = previousPeriodSales > 0 ? ((totalSales - previousPeriodSales) / previousPeriodSales) * 100 : 0;

    const salesMap = new Map<string, { qty: number, total: number }>();
    filteredTransactions
        .filter(t => t.type === TransactionType.SALE)
        .forEach(t => {
            const existing = salesMap.get(t.description) || { qty: 0, total: 0 };
            salesMap.set(t.description, { qty: existing.qty + 1, total: existing.total + t.amount });
        });

    const topProducts = Array.from(salesMap.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    return { chartData, totalSales, totalExpenses, netProfit, topProducts, periodLabel, growth };
  }, [transactions, timeframe]);

  const formatCurrency = (val: number) => `$ ${val.toLocaleString('es-AR')}`;

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 bg-background-dark sticky top-0 z-20">
        <Link to="/dashboard" className="flex size-12 shrink-0 items-center justify-start text-white active:opacity-70">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </Link>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight -ml-12">Reportes</h2>
      </div>

      <main className="flex-1 overflow-y-auto pb-40">
        {/* Sumarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            <div className="flex flex-col gap-2 rounded-xl p-4 bg-surface-dark border border-white/5">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Ventas</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalSales)}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-4 bg-surface-dark border border-white/5">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Gastos</p>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalExpenses)}</p>
            </div>
        </div>

        {/* Gráfico */}
        <div className="px-4 py-2">
            <div className="rounded-xl p-5 bg-surface-dark border border-white/5">
                <p className="text-sm font-bold text-white/70 mb-4 uppercase">Flujo de Caja ({periodLabel})</p>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} dy={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#102216', border: 'none', borderRadius: '12px' }} />
                            <Bar name="Ventas" dataKey="sales" fill="#13ec5b" radius={[4, 4, 0, 0]} />
                            <Bar name="Gastos" dataKey="expenses" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Top Products */}
        <h3 className="px-4 pb-3 pt-6 text-lg font-bold">Más Vendidos</h3>
        <div className="flex flex-col gap-3 px-4">
            {topProducts.map((item, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-surface-dark p-3 border border-white/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">{i+1}</div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate text-sm">{item.name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.qty} ventas</p>
                    </div>
                    <p className="font-bold text-white text-sm">{formatCurrency(item.total)}</p>
                </div>
            ))}
        </div>
      </main>

      {/* FAB Ajustado */}
      <div className="fixed bottom-24 right-6 z-50">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background-dark shadow-2xl hover:scale-110 active:scale-90 transition-all ring-4 ring-background-dark">
            <span className="material-symbols-outlined text-2xl font-bold">ios_share</span>
        </button>
      </div>
    </div>
  );
};

export default Reports;
