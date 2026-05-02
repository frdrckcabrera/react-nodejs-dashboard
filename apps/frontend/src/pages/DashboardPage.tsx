import { ArrowDownCircle, ArrowUpCircle, Landmark, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchDashboardOverview } from '../api/expenseApi';
import { CashFlowChart } from '../components/CashFlowChart';
import { ExpenseCategoryChart } from '../components/ExpenseCategoryChart';
import { MetricCard } from '../components/MetricCard';
import { RecentTransactionsTable } from '../components/RecentTransactionsTable';
import { WorkbookImporter } from '../components/WorkbookImporter';
import type { DashboardOverview } from '../types/finance';
import { formatCurrency } from '../utils/currency';

const emptyOverview: DashboardOverview = {
  summary: {
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    transactionCount: 0
  },
  expensesByCategory: [],
  monthlyCashFlow: [],
  recentTransactions: []
};

/**
 * Loads and renders the complete personal expenses dashboard page.
 * @returns {JSX.Element}
 */
export function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Retrieves the latest dashboard aggregates from the backend API.
   * @returns {Promise<void>}
   */
  const loadDashboardOverview = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      setOverview(await fetchDashboardOverview());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load the dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Loads dashboard data once when the page first renders.
   * @returns {void}
   */
  useEffect(() => {
    void loadDashboardOverview();
  }, [loadDashboardOverview]);

  const savingsTone = useMemo(() => (overview.summary.netSavings >= 0 ? 'saving' : 'expense'), [overview.summary.netSavings]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Expenses Dashboard</h1>
        </div>
        <WorkbookImporter onImported={loadDashboardOverview} />
      </header>

      {errorMessage && <div className="alert">{errorMessage}</div>}
      {isLoading && <div className="loading-bar" />}

      <section className="metrics-grid" aria-label="Financial summary">
        <MetricCard
          label="Total Income"
          value={formatCurrency(overview.summary.totalIncome)}
          detail="Imported income"
          icon={<ArrowUpCircle size={22} />}
          tone="income"
        />
        <MetricCard
          label="Total Expenses"
          value={formatCurrency(overview.summary.totalExpenses)}
          detail="Imported spend"
          icon={<ArrowDownCircle size={22} />}
          tone="expense"
        />
        <MetricCard
          label="Net Savings"
          value={formatCurrency(overview.summary.netSavings)}
          detail="Income minus expenses"
          icon={<Wallet size={22} />}
          tone={savingsTone}
        />
        <MetricCard
          label="Transactions"
          value={String(overview.summary.transactionCount)}
          detail="Rows stored in MySQL"
          icon={<Landmark size={22} />}
          tone="neutral"
        />
      </section>

      <section className="charts-grid">
        <CashFlowChart data={overview.monthlyCashFlow} />
        <ExpenseCategoryChart data={overview.expensesByCategory} />
      </section>

      <RecentTransactionsTable transactions={overview.recentTransactions} />
    </main>
  );
}
