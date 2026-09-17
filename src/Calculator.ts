import {
	CalculatorOptions,
	Region,
	StudentLoanPlans,
	IncomeTaxBreakdown,
	NationalInsuranceBreakdown
} from "./Interfaces"

import { YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS } from "./years"

export { YEARS as TAX_YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS }

const r = (n: number): number => Math.round(n * 100) / 100

const PLAN_NAMES = ["NO_PLAN", "PLAN_1", "PLAN_2", "PLAN_4", "PLAN_5", "POSTGRADUATE"]

const Calculator = (grossIncome: number, options: CalculatorOptions, taxYear: string = DEFAULT_TAX_YEAR) => {
	const year = YEARS[taxYear]
	if (!year) {
		throw new Error(`Unknown tax year "${taxYear}". Supported years: ${SUPPORTED_TAX_YEARS.join(", ")}`)
	}
	const region: Region = options.region ?? "england-wales-ni"
	const isScotland: boolean = region === "scotland"

	// Effective tax-free amount: PA tapered £1 per £2 over £100k, plus blind allowance.
	const allowance: number =
		(grossIncome > 100000 ? Math.max(0, year.pa - (grossIncome - 100000) / 2) : year.pa) +
		(options.blind ? year.blind : 0)
	// Salary-sacrifice pension reduces taxable income; NI stays on gross.
	const pension: number = (grossIncome / 100) * options.pensionPercentage
	const taxable: number = Math.max(0, grossIncome - allowance - pension)

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
