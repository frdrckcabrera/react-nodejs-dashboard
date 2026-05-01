import type { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/currency';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

/**
 * Displays the latest imported transactions in a scannable table.
 * @param props
 * @returns {JSX.Element}
 */
export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  return (
    <section className="table-panel">
      <div className="panel-heading">
        <h2>Recent Transactions</h2>
        <span>Latest imported rows</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>
                <td>
                  <span className={`type-badge type-badge--${transaction.type}`}>{transaction.type}</span>
                </td>
                <td>{formatCurrency(transaction.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <div className="empty-state">No transactions imported yet.</div>}
      </div>
    </section>
  );
}
