import React from 'react';
import { cn } from '@/src/lib/utils';

interface StatusBadgeProps {
  status: string;
  lang?: string;
}

export function StatusBadge({ status, lang = 'sw' }: StatusBadgeProps) {
  const styles: any = {
    submitted: "bg-blue-50 text-blue-600 border-blue-100",
    pending_review: "bg-purple-50 text-purple-600 border-purple-100",
    pending_payment: "bg-orange-50 text-orange-600 border-orange-100",
    paid: "bg-amber-50 text-amber-600 border-amber-100",
    verified: "bg-indigo-50 text-indigo-600 border-indigo-100",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    issued: "bg-emerald-600 text-white border-emerald-600",
    rejected: "bg-red-50 text-red-600 border-red-100",
    returned: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-cyan-50 text-cyan-600 border-cyan-100",
    refunded: "bg-stone-100 text-stone-600 border-stone-200",
  };

  const labelsSw: any = {
    submitted: "Imetumwa",
    pending_review: "Inasubiri Uhakiki",
    pending_payment: "Inasubiri Malipo",
    paid: "Imelipiwa",
    verified: "Imethibitishwa",
    approved: "Imeidhinishwa",
    issued: "Imetolewa",
    rejected: "Imekataliwa",
    returned: "Imerudishwa",
    processing: "Inashughulikiwa",
    refunded: "Imerejeshwa",
  };

  const labelsEn: any = {
    submitted: "Submitted",
    pending_review: "Pending Review",
    pending_payment: "Pending Payment",
    paid: "Paid",
    verified: "Verified",
    approved: "Approved",
    issued: "Issued",
    rejected: "Rejected",
    returned: "Returned",
    processing: "Processing",
    refunded: "Refunded",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", styles[status] || "bg-stone-100 text-stone-600")}>
      {lang === 'sw' ? labelsSw[status] || status : labelsEn[status] || status}
    </span>
  );
}
