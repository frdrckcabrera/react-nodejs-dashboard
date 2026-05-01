import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyCashFlow } from '../types/finance';
import { formatCurrency, formatMonth } from '../utils/currency';

interface CashFlowChartProps {
  data: MonthlyCashFlow[];
}

/**
 * Renders monthly income and expense trends as grouped bars.
 * @param props
 * @returns {JSX.Element}
 */
export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <section className="chart-panel chart-panel--wide">
      <div className="panel-heading">
        <h2>Monthly Cash Flow</h2>
        <span>Income versus expenses</span>
      </div>
      <div className="chart-panel__body">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickFormatter={formatMonth} />
              <YAxis tickFormatter={(value) => formatCurrency(Number(value))} width={88} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => formatMonth(String(label))}
              />
              <Legend />
              <Bar dataKey="income" fill="#0f766e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="#d97706" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">Import a workbook to see monthly trends.</div>
        )}
      </div>
    </section>
  );
}
