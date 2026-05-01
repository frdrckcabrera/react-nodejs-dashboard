import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: 'income' | 'expense' | 'saving' | 'neutral';
}

/**
 * Displays one high-level finance metric with consistent styling.
 * @param props
 * @returns {JSX.Element}
 */
export function MetricCard({ label, value, detail, icon, tone }: MetricCardProps) {
  return (
    <section className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </section>
  );
}
