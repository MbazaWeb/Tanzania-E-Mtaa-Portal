
export const EXCHANGE_RATES = {
  USD: 0.00038, // 1 TZS = 0.00038 USD (approx 1 USD = 2600 TZS)
  EUR: 0.00035,
  GBP: 0.00030,
  TZS: 1
};

export type CurrencyCode = keyof typeof EXCHANGE_RATES;

export const formatCurrency = (amount: number, code: CurrencyCode = 'TZS') => {
  const converted = amount * EXCHANGE_RATES[code];
  
  if (code === 'TZS') {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
  }).format(converted);
};
