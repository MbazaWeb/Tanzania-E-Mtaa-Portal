import React from 'react';
import { cn } from '@/src/lib/utils';
import { 
  ClipboardCheck, 
  CreditCard, 
  Search, 
  CheckCircle2, 
  FileCheck2,
  XCircle,
  RotateCcw
} from 'lucide-react';

interface ApplicationProgressBarProps {
  status: string;
  lang?: 'sw' | 'en';
  compact?: boolean;
}

export function ApplicationProgressBar({ status, lang = 'sw', compact = false }: ApplicationProgressBarProps) {
  const stages = [
    {
      id: 'submitted',
      labelSw: 'Imetumwa',
      labelEn: 'Submitted',
      icon: ClipboardCheck,
      descSw: 'Maombi yamepokelewa',
      descEn: 'Application received'
    },
    {
      id: 'pending_payment',
      labelSw: 'Malipo',
      labelEn: 'Payment',
      icon: CreditCard,
      descSw: 'Inasubiri malipo',
      descEn: 'Awaiting payment'
    },
    {
      id: 'paid',
      labelSw: 'Imelipiwa',
      labelEn: 'Paid',
      icon: CreditCard,
      descSw: 'Malipo yamefanyika',
      descEn: 'Payment made'
    },
    {
      id: 'verified',
      labelSw: 'Thibitisha',
      labelEn: 'Verify',
      icon: Search,
      descSw: 'Hakiki taarifa',
      descEn: 'Verifying details'
    },
    {
      id: 'approved',
      labelSw: 'Idhinishwa',
      labelEn: 'Approved',
      icon: CheckCircle2,
      descSw: 'Imeidhinishwa',
      descEn: 'Approved'
    },
    {
      id: 'issued',
      labelSw: 'Imetolewa',
      labelEn: 'Issued',
      icon: FileCheck2,
      descSw: 'Hati imetolewa',
      descEn: 'Document issued'
    }
  ];

  // Map statuses to their progress level
  const statusOrder: { [key: string]: number } = {
    'submitted': 0,
    'pending_review': 0, // Same as submitted
    'pending_payment': 1,
    'paid': 2,
    'verified': 3,
    'approved': 4,
    'issued': 5,
    'rejected': -1,
    'returned': -2,
  };

  const currentStageIndex = statusOrder[status] ?? 0;
  const isRejected = status === 'rejected';
  const isReturned = status === 'returned';

  // For rejected/returned, show special indicator
  if (isRejected) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="font-bold text-red-700">
            {lang === 'sw' ? 'Maombi Yamekataliwa' : 'Application Rejected'}
          </p>
          <p className="text-xs text-red-600">
            {lang === 'sw' ? 'Maombi haya yamepokea ukatazi' : 'This application has been rejected'}
          </p>
        </div>
      </div>
    );
  }

  if (isReturned) {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
          <RotateCcw className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-amber-700">
            {lang === 'sw' ? 'Imerudishwa kwa Marekebisho' : 'Returned for Changes'}
          </p>
          <p className="text-xs text-amber-600">
            {lang === 'sw' ? 'Mwombaji anatakiwa kufanya marekebisho' : 'Applicant needs to make changes'}
          </p>
        </div>
      </div>
    );
  }

  // Compact mode for table rows
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {stages.map((stage, index) => {
          const isCompleted = currentStageIndex >= index;
          const isCurrent = currentStageIndex === index;
          
          // Combine payment stages display
          if (stage.id === 'paid' && currentStageIndex < 2) return null;
          if (stage.id === 'pending_payment' && currentStageIndex >= 2) return null;

          return (
            <React.Fragment key={stage.id}>
              <div 
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  isCompleted ? "bg-emerald-500" : "bg-stone-200",
                  isCurrent && "ring-2 ring-emerald-300 ring-offset-1"
                )}
                title={lang === 'sw' ? stage.labelSw : stage.labelEn}
              />
              {index < stages.length - 1 && stage.id !== 'paid' && stage.id !== 'pending_payment' && (
                <div className={cn(
                  "h-0.5 w-3",
                  currentStageIndex > index ? "bg-emerald-500" : "bg-stone-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Full progress bar display
  // Show 5 stages: Submitted -> Payment -> Verified -> Approved -> Issued
  const displayStages = [
    stages[0], // submitted
    currentStageIndex >= 2 ? stages[2] : stages[1], // paid or pending_payment
    stages[3], // verified
    stages[4], // approved
    stages[5], // issued
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-stone-200 rounded-full z-0">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.max(0, Math.min(100, (currentStageIndex / (displayStages.length - 1)) * 100))}%` 
            }}
          />
        </div>

        {displayStages.map((stage, index) => {
          const stageIndex = statusOrder[stage.id] ?? 0;
          const isCompleted = currentStageIndex >= stageIndex;
          const isCurrent = currentStageIndex === stageIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex flex-col items-center z-10">
              <div 
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted 
                    ? "bg-emerald-500 text-white" 
                    : "bg-stone-200 text-stone-400",
                  isCurrent && "ring-4 ring-emerald-100"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className={cn(
                "mt-2 text-[10px] font-bold text-center max-w-16",
                isCompleted ? "text-emerald-700" : "text-stone-400"
              )}>
                {lang === 'sw' ? stage.labelSw : stage.labelEn}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Payment Status Badge for citizen view
interface PaymentStatusBadgeProps {
  status: string;
  isPaid: boolean;
  amount?: number;
  lang?: 'sw' | 'en';
}

export function PaymentStatusBadge({ status, isPaid, amount, lang = 'sw' }: PaymentStatusBadgeProps) {
  const needsPayment = ['submitted', 'pending_payment'].includes(status) && !isPaid;
  const paymentDone = isPaid || status === 'paid';

  if (needsPayment) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
        <CreditCard className="h-4 w-4 text-orange-600" />
        <span className="text-xs font-bold text-orange-700">
          {lang === 'sw' ? 'Inahitaji Malipo' : 'Payment Required'}
        </span>
        {amount !== undefined && amount > 0 && (
          <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
            TZS {amount.toLocaleString()}
          </span>
        )}
      </div>
    );
  }

  if (paymentDone) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-bold text-emerald-700">
          {lang === 'sw' ? 'Imelipiwa' : 'Paid'}
        </span>
      </div>
    );
  }

  return null;
}
