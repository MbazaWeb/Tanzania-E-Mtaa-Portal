import React from 'react';

interface InfoItemProps {
  label: string;
  value: string;
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{label}</p>
      <p className="text-stone-800 font-medium">{value}</p>
    </div>
  );
}
