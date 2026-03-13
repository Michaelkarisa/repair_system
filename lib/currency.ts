/**
 * Format a monetary amount using the shop's currency code.
 *
 * Usage:
 *   formatCurrency(1500)                // "KES 1,500" (default)
 *   formatCurrency(1500, 'USD')         // "US$1,500"
 *   formatCurrency(1500, shop.currency_code)
 */
export function formatCurrency(amount: number, currencyCode = 'KES'): string {
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if currency code is invalid
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
}

/**
 * Hook-free helper for components that already have the currency code string.
 * Components should get currency_code from useAuth() → user → shop data.
 */
export function useCurrencyFormatter(currencyCode = 'KES') {
  return (amount: number) => formatCurrency(amount, currencyCode);
}
