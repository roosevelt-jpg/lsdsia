export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function downPaymentCents(totalCents: number, percent = 50) {
  return Math.round((totalCents * percent) / 100);
}

export function balanceCents(totalCents: number, percent = 50) {
  return Math.max(0, totalCents - downPaymentCents(totalCents, percent));
}

/** Monthly installment for the post-down-payment balance (ceil to the cent). */
export function installmentCents(totalCents: number, percent: number, months: number) {
  if (months <= 0) return 0;
  return Math.ceil(balanceCents(totalCents, percent) / months);
}

export function paymentPlanSummary(
  totalCents: number,
  downPaymentPercent: number,
  installmentMonths: number,
) {
  const down = downPaymentCents(totalCents, downPaymentPercent);
  if (installmentMonths <= 0) {
    return `${formatUsd(totalCents)} due in full`;
  }
  const monthly = installmentCents(totalCents, downPaymentPercent, installmentMonths);
  return `${downPaymentPercent}% down (${formatUsd(down)}), then ${formatUsd(monthly)}/mo for ${installmentMonths} months`;
}
