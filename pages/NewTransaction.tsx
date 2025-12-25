
import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { useNavigate, Link } from 'react-router-dom';
import { TransactionType } from '../types';

const NewTransaction: React.FC = () => {
  const { addTransaction, customers, products } = useStore();
  const navigate = useNavigate();

  const [type, setType] = useState<TransactionType>(TransactionType.SALE);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const handleSubmit = () => {
    if (!description || !amount) return;

    addTransaction({
        type,
        description,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        customerId: selectedCustomer || undefined
    });

    navigate('/dashboard');
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (!productId) return;

    const product = products.find(p => p.id === productId);
    if (product) {
        setDescription(product.name);
        setAmount(product.price.toString());
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
       {/* Top Bar */}
       <div className="sticky top-0 z-30 flex h-16 items-center border-b border-white/10 bg-background-dark/95 backdrop-blur-sm px-4">
            <button onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10">
                <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-white">Nuevo Registro</h1>
            <div className="w-10"></div>
       </div>

       <main className="flex flex-1 flex-col p-4 pb-32">
         <div className="flex flex-col gap-y-6">
            <div>
                <p className="text-sm font-bold uppercase tracking-widest text-white/40 pb-2 ml-1">Tipo de Movimiento</p>
                <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary/10 p-1 border border-primary/20">
                    <label className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${type === TransactionType.SALE ? 'bg-primary text-background-dark shadow-sm' : 'text-primary hover:bg-primary/10'}`}>
                        Venta
                        <input type="radio" name="type" className="invisible w-0 absolute" checked={type === TransactionType.SALE} onChange={() => setType(TransactionType.SALE)} />
                    </label>
                    <label className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${type === TransactionType.EXPENSE ? 'bg-primary text-background-dark shadow-sm' : 'text-primary hover:bg-primary/10'}`}>
                        Gasto
                        <input type="radio" name="type" className="invisible w-0 absolute" checked={type === TransactionType.EXPENSE} onChange={() => setType(TransactionType.EXPENSE)} />
                    </label>
                </div>
            </div>

            {type === TransactionType.SALE && products.length > 0 && (
                <label className="flex flex-col animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-bold uppercase tracking-widest text-white/40 pb-2 ml-1">Desde Inventario</p>
                    <div className="relative">
                        <select className="flex h-14 w-full appearance-none rounded-xl border border-white/10 bg-surface-dark p-4 pr-10 text-base font-normal text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" onChange={handleProductSelect} defaultValue="">
                            <option value="" disabled>-- Seleccionar producto --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">inventory_2</span>
                    </div>
                </label>
            )}

            <label className="flex flex-col">
                <p className="text-sm font-bold uppercase tracking-widest text-white/40 pb-2 ml-1">Descripción</p>
                <input className="flex h-14 w-full rounded-xl border border-white/10 bg-surface-dark p-4 text-base font-normal text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder={type === TransactionType.SALE ? "ej. Venta de Taza" : "ej. Pago de alquiler"} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <label className="flex flex-col">
                <p className="text-sm font-bold uppercase tracking-widest text-white/40 pb-2 ml-1">Monto (ARS)</p>
                <div className="relative flex w-full items-center">
                    <span className="material-symbols-outlined absolute left-4 text-white/30">payments</span>
                    <input className="flex h-14 w-full rounded-xl border border-white/10 bg-surface-dark py-4 pl-12 pr-4 text-2xl font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary focus:outline-none transition-all" inputMode="decimal" placeholder="0.00" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
            </label>

            <label className="flex flex-col">
                <p className="text-sm font-bold uppercase tracking-widest text-white/40 pb-2 ml-1">Fecha</p>
                <div className="relative flex w-full items-center">
                    <input className="flex h-14 w-full rounded-xl border border-white/10 bg-surface-dark p-4 text-base text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    <span className="material-symbols-outlined absolute right-4 text-white/30 pointer-events-none">calendar_today</span>
                </div>
            </label>

            {type === TransactionType.SALE && (
                <label className="flex flex-col animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-bold uppercase tracking-widest text-white/40 pb-2 ml-1">Asignar a Cliente</p>
                    <div className="relative">
                        <select className="flex h-14 w-full appearance-none rounded-xl border border-white/10 bg-surface-dark p-4 pr-10 text-base text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                            <option value="">Ningún cliente (Venta rápida)</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">person</span>
                    </div>
                </label>
            )}
         </div>
       </main>

       {/* Botón de acción FIJO - Ahora sin barra inferior estorbando */}
       <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background-dark/95 backdrop-blur-md border-t border-white/5 z-50">
            <div className="max-w-md mx-auto">
                <button 
                    onClick={handleSubmit}
                    disabled={!description || !amount}
                    className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-lg font-bold text-background-dark shadow-[0_8px_20px_rgba(19,236,91,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                >
                    <span className="material-symbols-outlined mr-2">check_circle</span>
                    Guardar Registro
                </button>
            </div>
       </div>
    </div>
  );
};

export default NewTransaction;
