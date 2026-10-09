/** 格式化工具 */

export function formatMoney(n: number): string {
  return '¥' + n.toLocaleString('zh-CN')
}

/** 金额以「万」为单位展示，保留 1 位小数 */
export function formatWan(n: number, withUnit = true): string {
  const w = (n / 10000).toFixed(1)
  return withUnit ? `${w}万` : w
}

export function formatMonthly(n: number): string {
  return `${n.toLocaleString('zh-CN')}元/月`
}

export function diffDays(start: string, end: string): number {
  const s = new Date(start.replace(/-/g, '/')).getTime()
  const e = new Date(end.replace(/-/g, '/')).getTime()
  if (isNaN(s) || isNaN(e) || e <= s) return 1
  return Math.ceil((e - s) / 86400000)
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

export function formatDateShort(dt: string): string {
  if (!dt) return ''
  const parts = dt.split(' ')
  return parts[0] ?? dt
}

export function calcInstallment(
  price: number,
  downPaymentRate: number,
  months: number,
  rate: number
): { down: number; monthly: number; interest: number; total: number } {
  const down = Math.round(price * downPaymentRate)
  const loan = price - down
  const interest = Math.round(loan * (rate / 100) * (months / 12))
  const monthly = Math.round((loan + interest) / months)
  return { down, monthly, interest, total: down + loan + interest }
}
