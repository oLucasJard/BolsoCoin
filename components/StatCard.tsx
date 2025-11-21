import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: 'green' | 'red' | 'yellow' | 'blue';
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'yellow',
}: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-500',
    red: 'bg-red-500/20 text-red-500',
    yellow: 'bg-c6-yellow/20 text-c6-yellow',
    blue: 'bg-blue-500/20 text-blue-500',
  };

  return (
    <div className="card-c6 bg-c6-gray-900">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-c6-sm flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-c6-gray-400 text-sm mb-1">{title}</p>
      <p className={`font-display text-2xl sm:text-3xl font-bold ${color === 'green' ? 'text-green-500' : color === 'red' ? 'text-red-500' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
