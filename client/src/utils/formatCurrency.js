export const formatCurrency = (amount, currency = 'NGN') => {
  if (amount === 0 || amount === undefined || amount === null) return 'Free';
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency} ${formatted}`;
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-NG').format(num || 0);
};
