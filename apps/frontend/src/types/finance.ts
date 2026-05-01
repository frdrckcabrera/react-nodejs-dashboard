export type TransactionType = 'income' | 'expense';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
}

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  source: string;
}

export interface DashboardOverview {
  summary: FinancialSummary;
  expensesByCategory: CategoryExpense[];
  monthlyCashFlow: MonthlyCashFlow[];
  recentTransactions: Transaction[];
}

export interface ImportResult {
  importedCount: number;
  skippedCount: number;
}
