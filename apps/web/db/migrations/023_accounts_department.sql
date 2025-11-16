-- ACCOUNTS DEPARTMENT TABLES
-- Financial management, invoicing, expenses, payments, reporting

-- Invoices
CREATE TABLE IF NOT EXISTS accounts_invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  issue_date TEXT NOT NULL DEFAULT (date('now')),
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded')),
  currency TEXT DEFAULT 'GBP',
  subtotal REAL NOT NULL DEFAULT 0,
  tax_rate REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL DEFAULT 0,
  payment_terms TEXT,
  notes TEXT,
  line_items TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);

-- Expenses
CREATE TABLE IF NOT EXISTS accounts_expenses (
  id TEXT PRIMARY KEY,
  expense_number TEXT NOT NULL UNIQUE,
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  category TEXT NOT NULL CHECK (category IN ('office', 'travel', 'software', 'marketing', 'legal', 'consulting', 'utilities', 'rent', 'equipment', 'other')),
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  tax_amount REAL DEFAULT 0,
  receipt_url TEXT,
  expense_date TEXT NOT NULL DEFAULT (date('now')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'reimbursed')),
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'paypal', 'other')),
  approved_by TEXT,
  approved_at TEXT,
  metadata TEXT DEFAULT '{}',
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Payments (incoming and outgoing)
CREATE TABLE IF NOT EXISTS accounts_payments (
  id TEXT PRIMARY KEY,
  payment_number TEXT NOT NULL UNIQUE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('invoice_payment', 'expense_payment', 'refund', 'transfer', 'other')),
  related_invoice_id TEXT REFERENCES accounts_invoices(id) ON DELETE SET NULL,
  related_expense_id TEXT REFERENCES accounts_expenses(id) ON DELETE SET NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'credit_card', 'debit_card', 'paypal', 'stripe', 'cash', 'check', 'other')),
  payment_date TEXT NOT NULL DEFAULT (date('now')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  transaction_id TEXT,
  reference_number TEXT,
  notes TEXT,
  metadata TEXT DEFAULT '{}',
  processed_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Financial Accounts (bank accounts, credit cards, etc.)
CREATE TABLE IF NOT EXISTS accounts_financial_accounts (
  id TEXT PRIMARY KEY,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('bank', 'credit_card', 'savings', 'investment', 'paypal', 'stripe', 'other')),
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  currency TEXT DEFAULT 'GBP',
  balance REAL DEFAULT 0,
  available_balance REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed', 'frozen')),
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Budgets
CREATE TABLE IF NOT EXISTS accounts_budgets (
  id TEXT PRIMARY KEY,
  budget_name TEXT NOT NULL,
  category TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  budgeted_amount REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  spent_amount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  metadata TEXT DEFAULT '{}',
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Financial Reports
CREATE TABLE IF NOT EXISTS accounts_reports (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('profit_loss', 'balance_sheet', 'cash_flow', 'expense_report', 'revenue_report', 'tax_report', 'custom')),
  report_name TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  report_data TEXT NOT NULL,
  currency TEXT DEFAULT 'GBP',
  generated_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tax Records
CREATE TABLE IF NOT EXISTS accounts_tax_records (
  id TEXT PRIMARY KEY,
  tax_year TEXT NOT NULL,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('vat', 'income_tax', 'corporation_tax', 'payroll_tax', 'sales_tax', 'other')),
  taxable_amount REAL NOT NULL,
  tax_rate REAL NOT NULL,
  tax_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'filed', 'paid', 'refunded')),
  due_date TEXT,
  filed_date TEXT,
  paid_date TEXT,
  reference_number TEXT,
  metadata TEXT DEFAULT '{}',
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Recurring Transactions (subscriptions, recurring invoices, etc.)
CREATE TABLE IF NOT EXISTS accounts_recurring_transactions (
  id TEXT PRIMARY KEY,
  transaction_name TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('invoice', 'expense', 'payment')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  start_date TEXT NOT NULL,
  end_date TEXT,
  next_run_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  template_data TEXT DEFAULT '{}',
  metadata TEXT DEFAULT '{}',
  created_by_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_invoices_status ON accounts_invoices(status);
CREATE INDEX IF NOT EXISTS idx_accounts_invoices_client_name ON accounts_invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_accounts_invoices_due_date ON accounts_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_expenses_category ON accounts_expenses(category);
CREATE INDEX IF NOT EXISTS idx_accounts_expenses_status ON accounts_expenses(status);
CREATE INDEX IF NOT EXISTS idx_accounts_expenses_expense_date ON accounts_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_payments_payment_type ON accounts_payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_accounts_payments_status ON accounts_payments(status);
CREATE INDEX IF NOT EXISTS idx_accounts_payments_payment_date ON accounts_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_budgets_status ON accounts_budgets(status);
CREATE INDEX IF NOT EXISTS idx_accounts_budgets_period ON accounts_budgets(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_accounts_tax_records_tax_year ON accounts_tax_records(tax_year);
CREATE INDEX IF NOT EXISTS idx_accounts_tax_records_status ON accounts_tax_records(status);
CREATE INDEX IF NOT EXISTS idx_accounts_recurring_status ON accounts_recurring_transactions(status);
CREATE INDEX IF NOT EXISTS idx_accounts_recurring_next_run ON accounts_recurring_transactions(next_run_date);

