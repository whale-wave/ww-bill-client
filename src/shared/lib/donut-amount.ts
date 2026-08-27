export function getDonutAmountSize(formattedAmount: string) {
  if (formattedAmount.length <= 8)
    return 17;
  if (formattedAmount.length <= 11)
    return 14;
  return 11;
}
