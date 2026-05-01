import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryExpense } from '../types/finance';
import { formatCurrency } from '../utils/currency';

const CHART_COLORS = ['#0f766e', '#d97706', '#2563eb', '#be123c', '#7c3aed', '#15803d', '#c2410c'];

interface ExpenseCategoryChartProps {
  data: CategoryExpense[];
}

/**
 * Renders category expense share as a responsive donut chart.
 * @param props
 * @returns {JSX.Element}
 */
export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  return (
    <section className="chart-panel">
      <div className="panel-heading">
        <h2>Expense Mix</h2>
        <span>By category</span>
      </div>
      <div className="chart-panel__body">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} dataKey="amount" nameKey="category" innerRadius={68} outerRadius={110} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">No expense categories imported yet.</div>
        )}
      </div>
    </section>
  );
}
