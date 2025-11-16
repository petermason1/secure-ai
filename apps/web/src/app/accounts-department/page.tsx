'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AccountsBot {
  id: string;
  name: string;
  status: string;
  capabilities: string[];
  icon?: string;
}

interface AccountsStats {
  invoices_total: number;
  expenses_total: number;
  payments_total: number;
  outstanding_invoices: number;
}

export default function AccountsDepartmentPage() {
  const [bots, setBots] = useState<AccountsBot[]>([]);
  const [stats, setStats] = useState<AccountsStats>({
    invoices_total: 0,
    expenses_total: 0,
    payments_total: 0,
    outstanding_invoices: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses' | 'payments'>('overview');
  
  // Forms
  const [invoiceForm, setInvoiceForm] = useState({
    client_name: '',
    client_email: '',
    client_address: '',
    due_date: '',
    line_items: [{ description: '', quantity: 1, unit_price: 0 }],
    tax_rate: 20,
    discount_amount: 0,
  });
  const [expenseForm, setExpenseForm] = useState({
    vendor_name: '',
    category: 'other',
    description: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadDepartment();
  }, []);

  const loadDepartment = async () => {
    try {
      const response = await fetch('/api/accounts-department/list');
      const data = await response.json();
      if (data.success) {
        setBots(data.agents || []);
        setStats(data.stats || {
          invoices_total: 0,
          expenses_total: 0,
          payments_total: 0,
          outstanding_invoices: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load Accounts Department:', error);
    }
  };

  const handleCreateDepartment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/accounts-department/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('Accounts Department created successfully!');
        await loadDepartment();
      } else {
        alert('Error: ' + (data.error || 'Failed to create department'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.client_name || invoiceForm.line_items.length === 0) {
      alert('Client name and at least one line item are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/accounts-department/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceForm,
          line_items: invoiceForm.line_items.filter(item => item.description),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Invoice created! Invoice #${data.invoice.invoice_number}`);
        setInvoiceForm({
          client_name: '',
          client_email: '',
          client_address: '',
          due_date: '',
          line_items: [{ description: '', quantity: 1, unit_price: 0 }],
          tax_rate: 20,
          discount_amount: 0,
        });
        await loadDepartment();
      } else {
        alert('Error: ' + (data.error || 'Failed to create invoice'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!expenseForm.vendor_name || !expenseForm.description || !expenseForm.amount) {
      alert('Vendor name, description, and amount are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/accounts-department/expenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Expense created! Expense #${data.expense.expense_number}`);
        setExpenseForm({
          vendor_name: '',
          category: 'other',
          description: '',
          amount: 0,
          expense_date: new Date().toISOString().split('T')[0],
        });
        await loadDepartment();
      } else {
        alert('Error: ' + (data.error || 'Failed to create expense'));
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            💰 Accounts Department
          </h1>
          <p className="text-xl text-slate-300">
            Financial management, invoicing, expenses, payments, reporting, tax, and compliance
          </p>
        </div>

        {bots.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center mb-6">
            <p className="text-slate-400 mb-4">Accounts Department not initialized</p>
            <button
              onClick={handleCreateDepartment}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Initialize Accounts Department'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-white">£{stats.invoices_total.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-white">£{stats.expenses_total.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400 mb-1">Payments Processed</p>
            <p className="text-2xl font-bold text-white">£{stats.payments_total.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
            <p className="text-sm text-slate-400 mb-1">Outstanding Invoices</p>
            <p className="text-2xl font-bold text-orange-400">{stats.outstanding_invoices}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {(['overview', 'invoices', 'expenses', 'payments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Accounts Bots</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bots.map((bot) => (
                <div key={bot.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{bot.icon || '🤖'}</span>
                    <div>
                      <h3 className="font-bold text-white">{bot.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        bot.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {bot.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bot.capabilities.slice(0, 3).map((cap, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Create Invoice</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Client Name *</label>
                  <input
                    type="text"
                    value={invoiceForm.client_name}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, client_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="Client Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={invoiceForm.client_email}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, client_email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Line Items *</label>
                {invoiceForm.line_items.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.line_items];
                        newItems[index].description = e.target.value;
                        setInvoiceForm({ ...invoiceForm, line_items: newItems });
                      }}
                      className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.line_items];
                        newItems[index].quantity = parseInt(e.target.value) || 1;
                        setInvoiceForm({ ...invoiceForm, line_items: newItems });
                      }}
                      className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => {
                        const newItems = [...invoiceForm.line_items];
                        newItems[index].unit_price = parseFloat(e.target.value) || 0;
                        setInvoiceForm({ ...invoiceForm, line_items: newItems });
                      }}
                      className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                      placeholder="Price"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setInvoiceForm({
                    ...invoiceForm,
                    line_items: [...invoiceForm.line_items, { description: '', quantity: 1, unit_price: 0 }],
                  })}
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  + Add Line Item
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={invoiceForm.tax_rate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Discount Amount</label>
                  <input
                    type="number"
                    value={invoiceForm.discount_amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, discount_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateInvoice}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Create Expense</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Vendor Name *</label>
                  <input
                    type="text"
                    value={expenseForm.vendor_name}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="Vendor Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  >
                    <option value="office">Office</option>
                    <option value="travel">Travel</option>
                    <option value="software">Software</option>
                    <option value="marketing">Marketing</option>
                    <option value="legal">Legal</option>
                    <option value="consulting">Consulting</option>
                    <option value="utilities">Utilities</option>
                    <option value="rent">Rent</option>
                    <option value="equipment">Equipment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description *</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-white"
                  rows={3}
                  placeholder="Expense description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Expense Date</label>
                  <input
                    type="date"
                    value={expenseForm.expense_date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateExpense}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                {loading ? 'Creating...' : 'Create Expense'}
              </button>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-400">Payment processing features coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

