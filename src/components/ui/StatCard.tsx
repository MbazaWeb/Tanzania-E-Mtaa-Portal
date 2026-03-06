import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-stone-50">{icon}</div>
      </div>
      <p className="text-sm font-semibold text-stone-500">{label}</p>
      <p className="text-2xl font-bold text-stone-800 mt-1">{value}</p>
    </div>
  );
}
