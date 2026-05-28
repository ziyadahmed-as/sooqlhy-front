import React from 'react';

type Status = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

interface Props {
  status: Status;
}

const statusColors: Record<Status, string> = {
  PENDING: '#F59E0B', // amber-500
  UNDER_REVIEW: '#3B82F6', // blue-500
  APPROVED: '#10B981', // teal-500
  REJECTED: '#F87171', // coral/red-400
};

export const KycStatusBadge: React.FC<Props> = ({ status }) => {
  const color = statusColors[status] || '#9CA3AF';
  const style: React.CSSProperties = {
    backgroundColor: `${color}20`, // 12% opacity
    color,
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
  };
  return <span style={style}>{status.replace('_', ' ')}</span>;
};

export default KycStatusBadge;
