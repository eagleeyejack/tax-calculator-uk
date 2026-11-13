import {
	CalculatorOptions,
	Region,
	StudentLoanPlans,
	IncomeTaxBreakdown,
	NationalInsuranceBreakdown
} from "./Interfaces"

import { YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS } from "./years"

export { YEARS as TAX_YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS }

// Round to the penny, half-up (half away from zero). With pence inputs and the table's
// rates (at most four decimals) a true non-tie is at least 0.0001 pence from the half-way
// point, so the 1e-6 pence nudge only absorbs binary float noise, which otherwise makes
// an exact half-penny round down (185.50 x 19% = 35.245 -> 3524.4999999999995 -> 35.24).
// It is not meant for inputs with more decimals or amounts beyond ~£10m.
const r = (n: number): number => (n < 0 ? -1 : 1) * (Math.round(Math.abs(n) * 100 + 1e-6) / 100)

const PLAN_NAMES = ["NO_PLAN", "PLAN_1", "PLAN_2", "PLAN_4", "PLAN_5", "POSTGRADUATE"]

const Calculator = (grossIncome: number, options: CalculatorOptions, taxYear: string = DEFAULT_TAX_YEAR) => {
	const year = YEARS[taxYear]
	if (!year) {
		throw new Error(`Unknown tax year "${taxYear}". Supported years: ${SUPPORTED_TAX_YEARS.join(", ")}`)
	}
	const region: Region = options.region ?? "england-wales-ni"
	const isScotland: boolean = region === "scotland"

	// Salary-sacrifice pension reduces taxable income; NI stays on gross.
	const pension: number = (grossIncome / 100) * options.pensionPercentage
	// The PA taper is on adjusted net income, which is net of pension contributions,
	// so it is measured on income after the pension deduction, not on gross pay.
	const adjustedIncome: number = grossIncome - pension
	// PA is reduced by one-half of the income over £100k, and what remains is rounded UP to a
	// whole pound (Income Tax Act 2007 s.35(2) and (3)): £100,001 keeps 12,570, not 12,569.50.
	// The 1e-7 nudge only absorbs binary float noise in the subtraction above, which could
	// otherwise lift a whole-pound allowance to the next pound. With pence inputs and a whole
	// pensionPercentage a true part-pound is at least 0.00005 above the pound, so it is not moved.
	const taperedPa: number =
		adjustedIncome > 100000 ? Math.max(0, Math.ceil(year.pa - (adjustedIncome - 100000) / 2 - 1e-7)) : year.pa
	// Effective tax-free amount: tapered PA plus blind allowance.
	const allowance: number = taperedPa + (options.blind ? year.blind : 0)
	const taxable: number = Math.max(0, adjustedIncome - allowance)

	// Slice taxable income through [width, rate] bands (width 0 = remainder).
	const slice = (bands: [number, number][]): number[] => {
		let rest: number = taxable
		return bands.map(([width, rate]) => {
			const take: number = width === 0 ? Math.max(0, rest) : Math.min(Math.max(0, rest), width)
			rest -= take
			return r(take * rate)
		})
	}

	const rUkBands: [number, number][] = [[year.bb, 0.2], [year.at - year.bb, 0.4], [0, 0.45]]
	const scotBands: [number, number][] = year.scot.map(([, width, rate]) => [width, rate])
	const bandTaxes: number[] = slice(isScotland ? scotBands : rUkBands)
	const totalIncomeTax: number = r(bandTaxes.reduce((sum, tax) => sum + tax, 0))

	// Legacy rUK buckets with carry, byte-identical to v1/v2 maths.
	const rUkBreakdown = (): IncomeTaxBreakdown => {
		const b20: number = Math.min(taxable, year.bb)
		const b40: number = Math.min(Math.max(0, taxable - year.bb), year.at - year.bb)
		const b45: number = Math.max(0, taxable - year.at)
		return {
			rate_0: { tax: 0, carry: taxable },
			rate_20: { tax: r(b20 * 0.2), carry: taxable - b20 },
			rate_40: { tax: r(b40 * 0.4), carry: b45 },
			rate_45: { tax: r(b45 * 0.45), carry: 0 }
		}
	}

	// Employee NICs on gross; none at/above state pension age.
	const niMain: number = options.age >= year.penAge ? 0 : r(Math.min(Math.max(0, grossIncome - year.ni[1]), year.ni[2] - year.ni[1]) * year.ni[0])
	const niUpper: number = options.age >= year.penAge ? 0 : r(Math.max(0, grossIncome - year.ni[2]) * 0.02)
	const niBreakdown: NationalInsuranceBreakdown = {
		rate_0: { tax: 0 },
		rate_12: { tax: niMain },
		rate_2: { tax: niUpper }
	}

	// Student loans: 9% undergrad (plan 5 rate varies), 6% postgraduate.
	const plan: number = options.studentLoanPlan
	const slThresholds: number[] = [0, year.sl[0], year.sl[1], year.sl[2], year.sl[3], year.sl[4]]
	const slRates: number[] = [0, 0.09, 0.09, 0.09, year.sl[5], 0.06]
	const slRepayment: number = r(Math.max(0, grossIncome - (slThresholds[plan] ?? 0)) * (slRates[plan] ?? 0))

	const deductions: number = r(totalIncomeTax + niMain + niUpper + slRepayment)
	const netYearly: number = r(grossIncome - deductions - pension)

	const scotDetail = (): Record<string, { rate: number; tax: number }> =>
		Object.fromEntries(year.scot.map(([name, , rate], i) => [name, { rate, tax: bandTaxes[i] }]))

	return {
		grossIncome,
		options,
		taxYear,
		region,
		getTaxBreakdown: () => ({
			taxYear,
			region,
			netIncome: {
				yearly: netYearly,
				monthly: r(netYearly / 12),
				weekly: r(netYearly / 52),
				daily: r(netYearly / 365)
			},
			personalAllowance: r(allowance - (options.blind ? year.blind : 0)),
			paye: isScotland ? scotDetail() : rUkBreakdown(),
			bands: isScotland
				? year.scot.map(([name, , rate], i) => ({ name, rate, tax: bandTaxes[i] }))
				: [
						{ name: "basic", rate: 0.2, tax: bandTaxes[0] },
						{ name: "higher", rate: 0.4, tax: bandTaxes[1] },
						{ name: "additional", rate: 0.45, tax: bandTaxes[2] }
					],
			nationalInsurance: niBreakdown,
			studentLoan: {
				plan: PLAN_NAMES[plan] ?? "NO_PLAN",
				threshold: slThresholds[plan] ?? 0,
				rate: slRates[plan] ?? 0,
				repayment: slRepayment
			}
		})
	}
}

export default Calculator
