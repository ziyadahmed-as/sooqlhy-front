// components/shared/MetricCard.tsx
import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export const MetricCard: React.FC<Props> = ({ icon, label, value }) => (
  <div className="glass-card flex items-center gap-3 p-4">
    <div className="text-primary-600">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);
