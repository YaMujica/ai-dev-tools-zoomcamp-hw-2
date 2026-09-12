import React from 'react';
import { Users, Clock, CheckCircle2, UserCheck } from 'lucide-react';

export default function StatsBar({ stats }) {
  const cards = [
    {
      label: 'Parties Waiting',
      value: stats?.active_parties ?? 0,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Guests Waiting',
      value: stats?.total_guests_waiting ?? 0,
      icon: UserCheck,
      color: 'indigo'
    },
    {
      label: 'Avg. Wait Time',
      value: `${stats?.avg_wait_minutes ?? 0}m`,
      icon: Clock,
      color: 'amber'
    },
    {
      label: 'Seated Today',
      value: stats?.seated_today ?? 0,
      icon: CheckCircle2,
      color: 'emerald'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`stat-card stat-${card.color}`}>
            <div className="stat-icon-wrapper">
              <Icon className="stat-icon" size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
