import React, { useState } from 'react';
import { Expense, Income, Bill, BcCommittee, Loan, SavingsGoal } from '../types';
import confetti from 'canvas-confetti';
import {
  TrendingDown,
  TrendingUp,
  Receipt,
  Landmark,
  Users,
  ArrowRightLeft,
  Target,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
  Printer,
  AlertCircle
} from 'lucide-react';

// 1. EXPENSE TRACKER
export const ExpenseTrackerView: React.FC<{
  expenses: Expense[];
  onSaveExpenses: (list: Expense[]) => void;
}> = ({ expenses, onSaveExpenses }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Medical Supplies');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    const newExp: Expense = {
      id: 'exp-' + Date.now(),
      title,
      amount: parseFloat(amount),
      category,
      date,
      note
    };
    onSaveExpenses([newExp, ...expenses]);
    setTitle('');
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    onSaveExpenses(expenses.filter((e) => e.id !== id));
  };

  const categories = ['Medical Supplies', 'Utilities', 'Office Supplies', 'Fuel', 'Food & Dining', 'Maintenance', 'Travel', 'Other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono text-rose-600 dark:text-rose-400 font-bold tracking-wider">Outflow Ledger</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Expense Tracker</h2>
          <p className="text-slate-500 text-sm mt-0.5">Total Recorded Outflow: <span className="font-bold text-rose-600 dark:text-rose-400">Rs. {totalExpense.toLocaleString()}</span></p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Record New Expense</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Expense Title / Item</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hospital ICU Monitor Battery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 4500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="Receipt number or details"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700/60 font-semibold text-slate-800 dark:text-slate-200">
          Transaction Records ({expenses.length})
        </div>
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No expenses recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {expenses.map((exp) => (
              <div key={exp.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{exp.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-medium">{exp.category}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                      {exp.note && (
                        <>
                          <span>•</span>
                          <span className="italic">{exp.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-base whitespace-nowrap">
                    - Rs. {exp.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 2. INCOME TRACKER
export const IncomeTrackerView: React.FC<{
  income: Income[];
  onSaveIncome: (list: Income[]) => void;
}> = ({ income, onSaveIncome }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Government Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    const newInc: Income = {
      id: 'inc-' + Date.now(),
      title,
      amount: parseFloat(amount),
      source,
      date,
      note
    };
    onSaveIncome([newInc, ...income]);
    setTitle('');
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    onSaveIncome(income.filter((i) => i.id !== id));
  };

  const sources = ['Government Salary', 'Private Clinic', 'Honorarium', 'Investments', 'Freelancing', 'Gift', 'Other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">Revenue Ledger</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Income Tracker</h2>
          <p className="text-slate-500 text-sm mt-0.5">Total Inflow Recorded: <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs. {totalIncome.toLocaleString()}</span></p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Record New Income</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Income Stream / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health KP Monthly Pay Slip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {sources.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="Bank deposit or remarks"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md"
                >
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700/60 font-semibold text-slate-800 dark:text-slate-200">
          Deposit Streams ({income.length})
        </div>
        {income.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No income recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {income.map((inc) => (
              <div key={inc.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{inc.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-medium">{inc.source}</span>
                      <span>•</span>
                      <span>{inc.date}</span>
                      {inc.note && (
                        <>
                          <span>•</span>
                          <span className="italic">{inc.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base whitespace-nowrap">
                    + Rs. {inc.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDelete(inc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. UTILITY BILLS
export const UtilityBillsView: React.FC<{
  bills: Bill[];
  onSaveBills: (list: Bill[]) => void;
}> = ({ bills, onSaveBills }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Electricity');

  const togglePaid = (id: string) => {
    onSaveBills(
      bills.map((b) => (b.id === id ? { ...b, isPaid: b.isPaid ? 0 : 1 } : b))
    );
  };

  const handleDelete = (id: string) => {
    onSaveBills(bills.filter((b) => b.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;
    const newBill: Bill = {
      id: 'bill-' + Date.now(),
      name,
      amount: parseFloat(amount),
      dueDate,
      isPaid: 0,
      category
    };
    onSaveBills([newBill, ...bills]);
    setName('');
    setAmount('');
    setDueDate('');
    setShowAddModal(false);
  };

  const unpaidTotal = bills.filter((b) => !b.isPaid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono text-blue-600 dark:text-blue-400 font-bold tracking-wider">Utility Invoices</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Utility Bills</h2>
          <p className="text-slate-500 text-sm mt-0.5">Pending Payments: <span className="font-bold text-rose-600 dark:text-rose-400">Rs. {unpaidTotal.toLocaleString()}</span></p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bill</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Utility Bill</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Bill Name / Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WAPDA Electricity Bill Pacha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 18500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Utility Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                >
                  <option value="Electricity">Electricity (WAPDA / PESCO)</option>
                  <option value="Gas">Sui Gas (SNGPL)</option>
                  <option value="Internet">Broadband / PTCL</option>
                  <option value="Water">Water Supply</option>
                  <option value="Telephone">Mobile / Telephone</option>
                </select>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className={`p-5 rounded-3xl border transition-all ${
              bill.isPaid
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-80'
                : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/60 shadow-xs hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {bill.category}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">{bill.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due Date: {bill.dueDate}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Rs. {bill.amount.toLocaleString()}
                </div>
                <div className="mt-1">
                  {bill.isPaid ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> Unpaid
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <button
                onClick={() => togglePaid(bill.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                  bill.isPaid
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
              </button>
              <button
                onClick={() => handleDelete(bill.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. ZAKAT CALCULATOR
export const ZakatCalculatorView: React.FC = () => {
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [goldRatePerGram, setGoldRatePerGram] = useState<number>(24500);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [silverRatePerGram, setSilverRatePerGram] = useState<number>(310);
  const [cashInHand, setCashInHand] = useState<number>(350000);
  const [bankBalances, setBankBalances] = useState<number>(850000);
  const [businessStock, setBusinessStock] = useState<number>(0);
  const [debtsOwedToMe, setDebtsOwedToMe] = useState<number>(30000);
  const [immediateLiabilities, setImmediateLiabilities] = useState<number>(25000);

  const silverNisabValue = 612.36 * silverRatePerGram;

  const totalAssets =
    goldGrams * goldRatePerGram +
    silverGrams * silverRatePerGram +
    cashInHand +
    bankBalances +
    businessStock +
    debtsOwedToMe;

  const netZakatPool = Math.max(0, totalAssets - immediateLiabilities);
  const isEligible = netZakatPool >= silverNisabValue;
  const zakatPayable = isEligible ? netZakatPool * 0.025 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <span className="text-xs uppercase font-mono text-teal-600 dark:text-teal-400 font-bold tracking-wider">Islamic Obligation</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Zakat Calculator</h2>
        <p className="text-slate-500 text-sm mt-1">
          Calculate your obligatory 2.5% wealth Zakat based on Islamic Nisab thresholds. Silver Nisab benchmark: 612.36 grams (Rs. {Math.round(silverNisabValue).toLocaleString()}).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b pb-2 border-slate-100 dark:border-slate-700">
            Gold & Silver Assets
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Gold (Grams)</label>
              <input
                type="number"
                min="0"
                value={goldGrams}
                onChange={(e) => setGoldGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Gold Rate/g (PKR)</label>
              <input
                type="number"
                min="0"
                value={goldRatePerGram}
                onChange={(e) => setGoldRatePerGram(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Silver (Grams)</label>
              <input
                type="number"
                min="0"
                value={silverGrams}
                onChange={(e) => setSilverGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Silver Rate/g (PKR)</label>
              <input
                type="number"
                min="0"
                value={silverRatePerGram}
                onChange={(e) => setSilverRatePerGram(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b pt-2 pb-2 border-slate-100 dark:border-slate-700">
            Cash & Liquid Holdings
          </h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Cash in Hand (PKR)</label>
            <input
              type="number"
              min="0"
              value={cashInHand}
              onChange={(e) => setCashInHand(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Bank Accounts & Savings (PKR)</label>
            <input
              type="number"
              min="0"
              value={bankBalances}
              onChange={(e) => setBankBalances(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Debts Owed To You (Good Receivables)</label>
            <input
              type="number"
              min="0"
              value={debtsOwedToMe}
              onChange={(e) => setDebtsOwedToMe(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-rose-600 dark:text-rose-400 mb-1">Less Immediate Deductible Debts / Bills</label>
            <input
              type="number"
              min="0"
              value={immediateLiabilities}
              onChange={(e) => setImmediateLiabilities(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="bg-linear-to-br from-teal-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>2.5% Rate on Net Zakatable Pool</span>
            </div>

            <h4 className="text-teal-200 text-sm font-medium">Net Zakatable Wealth</h4>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Rs. {Math.round(netZakatPool).toLocaleString()}
            </div>

            <div className="mt-6 space-y-2.5 text-xs text-teal-100/90 border-t border-teal-800/80 pt-4">
              <div className="flex justify-between">
                <span>Silver Nisab Threshold:</span>
                <span className="font-semibold">Rs. {Math.round(silverNisabValue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Nisab Status:</span>
                <span className={`font-bold ${isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isEligible ? 'Eligible for Zakat (Above Nisab)' : 'Below Nisab (No Zakat Due)'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-teal-800">
            <span className="text-xs uppercase font-mono tracking-wider text-teal-300">Total Obligatory Zakat Due</span>
            <div className="text-3xl sm:text-5xl font-black text-emerald-400 mt-1">
              Rs. {Math.round(zakatPayable).toLocaleString()}
            </div>
            <p className="text-xs text-teal-200/80 mt-2">
              Payable to legitimate Asnaf-e-Zakat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. BC COMMITTEES
export const BcCommitteeView: React.FC<{
  committees: BcCommittee[];
  onSaveCommittees: (list: BcCommittee[]) => void;
}> = ({ committees, onSaveCommittees }) => {
  const [selectedCommitteeId] = useState<string>(committees[0]?.id || '');
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

  const committee = committees.find((c) => c.id === selectedCommitteeId) || committees[0];

  const handleDrawWinner = () => {
    if (!committee) return;
    const eligibleMembers = committee.members.filter((m) => !m.hasReceived);
    if (eligibleMembers.length === 0) {
      setWinnerMessage('All committee members have already received their payout cycle!');
      return;
    }
    const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
    const luckyWinner = eligibleMembers[randomIndex];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const potAmount = committee.amountPerHead * committee.totalMembers;
    setWinnerMessage(`🎉 MUBARAK! ${luckyWinner.name} wins the lucky draw payout of Rs. ${potAmount.toLocaleString()}!`);

    const updatedMembers = committee.members.map((m) =>
      m.id === luckyWinner.id ? { ...m, hasReceived: 1 } : m
    );
    const updatedCommittees = committees.map((c) =>
      c.id === committee.id ? { ...c, members: updatedMembers } : c
    );
    onSaveCommittees(updatedCommittees);
  };

  const toggleMemberPaid = (memberId: string) => {
    if (!committee) return;
    const updatedMembers = committee.members.map((m) =>
      m.id === memberId ? { ...m, hasReceived: m.hasReceived ? 0 : 1 } : m
    );
    const updatedCommittees = committees.map((c) =>
      c.id === committee.id ? { ...c, members: updatedMembers } : c
    );
    onSaveCommittees(updatedCommittees);
  };

  if (!committee) {
    return <div className="p-8 text-center text-slate-500">No BC Committee configured.</div>;
  }

  const potAmount = committee.amountPerHead * committee.totalMembers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono text-purple-600 dark:text-purple-400 font-bold tracking-wider">Kameti / Bishi Pool</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{committee.name}</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Per Head: <span className="font-semibold text-slate-700 dark:text-slate-200">Rs. {committee.amountPerHead.toLocaleString()}</span> • Total Monthly Pool: <span className="font-bold text-purple-600 dark:text-purple-400">Rs. {potAmount.toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={handleDrawWinner}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Draw Lucky Member!</span>
        </button>
      </div>

      {winnerMessage && (
        <div className="p-4 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-bold text-center text-sm sm:text-base animate-bounce">
          {winnerMessage}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700/60 font-semibold text-slate-800 dark:text-slate-200">
          Committee Members ({committee.members.length} / {committee.totalMembers})
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {committee.members.map((m, idx) => (
            <div key={m.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{m.name}</h4>
                  <div className="text-xs text-slate-500">Position #{m.payoutPosition} in roster</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${m.hasReceived ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                  {m.hasReceived ? 'Received Payout' : 'Waiting in Queue'}
                </span>
                <button
                  onClick={() => toggleMemberPaid(m.id)}
                  className="text-xs px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {m.hasReceived ? 'Undo' : 'Mark Received'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. LOAN LEDGER
export const LoanTrackerView: React.FC<{
  loans: Loan[];
  onSaveLoans: (list: Loan[]) => void;
}> = ({ loans, onSaveLoans }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'I Lent' | 'I Borrowed'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'I Lent' | 'I Borrowed'>('I Lent');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const filteredLoans = loans.filter((l) => (activeTab === 'All' ? true : l.type === activeTab));

  const totalLent = loans.filter((l) => l.type === 'I Lent' && !l.isSettled).reduce((s, l) => s + l.amount, 0);
  const totalBorrowed = loans.filter((l) => l.type === 'I Borrowed' && !l.isSettled).reduce((s, l) => s + l.amount, 0);

  const toggleSettled = (id: string) => {
    onSaveLoans(
      loans.map((l) => (l.id === id ? { ...l, isSettled: l.isSettled ? 0 : 1 } : l))
    );
  };

  const handleDelete = (id: string) => {
    onSaveLoans(loans.filter((l) => l.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;
    const newLoan: Loan = {
      id: 'loan-' + Date.now(),
      personName,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().split('T')[0],
      dueDate,
      isSettled: 0,
      note
    };
    onSaveLoans([newLoan, ...loans]);
    setPersonName('');
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono text-amber-600 dark:text-amber-400 font-bold tracking-wider">Debt & Receivables</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Loan Ledger</h2>
          <div className="flex gap-4 text-xs mt-1">
            <span className="text-emerald-600 font-semibold">I Lent: Rs. {totalLent.toLocaleString()}</span>
            <span className="text-rose-600 font-semibold">I Borrowed: Rs. {totalBorrowed.toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Loan</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Record New Loan</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Person Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. SaadUllah"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Loan Direction</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'I Lent' | 'I Borrowed')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="I Lent">I Lent (They owe me)</option>
                    <option value="I Borrowed">I Borrowed (I owe them)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 20000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md"
                >
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(['All', 'I Lent', 'I Borrowed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold ${
              activeTab === t ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {filteredLoans.map((l) => (
            <div key={l.id} className="p-4 sm:px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${l.type === 'I Lent' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{l.personName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{l.type}</span>
                    <span>•</span>
                    <span>Due: {l.dueDate || 'Flexible'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold text-base ${l.type === 'I Lent' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Rs. {l.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => toggleSettled(l.id)}
                  className={`text-xs px-3 py-1 rounded-xl font-medium ${
                    l.isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {l.isSettled ? 'Settled ✓' : 'Mark Settled'}
                </button>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 7. SAVINGS GOALS
export const SavingsGoalsView: React.FC<{
  goals: SavingsGoal[];
  onSaveGoals: (list: SavingsGoal[]) => void;
}> = ({ goals, onSaveGoals }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    const newGoal: SavingsGoal = {
      id: 'save-' + Date.now(),
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      color: '#059669'
    };
    onSaveGoals([...goals, newGoal]);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setShowAddModal(false);
  };

  const handleDeposit = (id: string) => {
    const amountStr = prompt('Enter deposit amount in PKR:');
    if (!amountStr) return;
    const deposit = parseFloat(amountStr);
    if (isNaN(deposit) || deposit <= 0) return;

    onSaveGoals(
      goals.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount + deposit } : g))
    );
  };

  const handleDelete = (id: string) => {
    onSaveGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <span className="text-xs uppercase font-mono text-teal-600 dark:text-teal-400 font-bold tracking-wider">Target Funds</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Savings Goal</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hajj Pilgrimage 2027"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Target (PKR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1200000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Initial Saved (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 200000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          return (
            <div key={g.id} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{g.title}</h4>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">Rs. {g.currentAmount.toLocaleString()}</span>
                  <span className="text-slate-500">Goal: Rs. {g.targetAmount.toLocaleString()} ({percent}%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-teal-500 to-emerald-600 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleDeposit(g.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit Funds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 8. FINANCIAL REPORT
export const FinanceReportView: React.FC<{
  expenses: Expense[];
  income: Income[];
  bills: Bill[];
  loans: Loan[];
  savings: SavingsGoal[];
}> = ({ expenses, income, bills, loans, savings }) => {
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleExportJSON = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      appName: 'Hikmah Omni Suite / StudentKit Buner',
      expenses,
      income,
      bills,
      loans,
      savings
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hikmah_financial_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs no-print">
        <div>
          <span className="text-xs uppercase font-mono text-slate-500 font-bold tracking-wider">Audit Statement</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Statement & Backup</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6 print-page">
        <div className="text-center border-b pb-6 border-slate-200 dark:border-slate-700">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white uppercase tracking-wider">
            Office of the Medical Superintendent
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Govt Category-D Hospital Pacha Kalay Buner • Comprehensive Financial Ledger Statement
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Total Credit Inflow</span>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              Rs. {totalIncome.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">Total Debit Outflow</span>
            <div className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1">
              Rs. {totalExpense.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
            <span className="text-xs text-teal-700 dark:text-teal-300 font-medium">Net Operating Reserve</span>
            <div className="text-xl font-bold text-teal-700 dark:text-teal-300 mt-1">
              Rs. {netBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
