import {
	TaxSettings,
	StudentLoanPlans,
	CalculatorOptions,
	Region,
	ScottishBand,
	TaxRate,
	IncomeTax,
	IncomeTaxBreakdown,
	TaxBreakdownItem,
	NationalInsuranceBreakdown
} from "./Interfaces"

import { getAmountRounded } from "./utils/rounded"
import { TAX_YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS } from "./TaxYears"

export { TAX_YEARS, DEFAULT_TAX_YEAR, SUPPORTED_TAX_YEARS }

const Calculator = (grossIncome: number, options: CalculatorOptions, taxYear: string = DEFAULT_TAX_YEAR) => {
	const taxSettings: TaxSettings = TAX_YEARS[taxYear]
	if (!taxSettings) {
		throw new Error(
			`Unknown tax year "${taxYear}". Supported years: ${SUPPORTED_TAX_YEARS.join(", ")}`
		)
	}
	let calculator = {} as any

	calculator.grossIncome = grossIncome
	calculator.options = options
	calculator.taxYear = taxSettings.year

	const region: Region = options.region ?? "england-wales-ni"
	calculator.region = region
	const isScotland: boolean = region === "scotland"

	/**
	 * Age-related personal allowance additions were abolished in April 2016.
	 * Kept for backward compatibility — always 0.
	 */
	const getAgeRelatedContributions = (): number => 0

	/**
	 * Kept for backward compatibility — always 0 (see above).
	 */
	const getAgeRelatedTaperDeductions = (): number => 0

	/**
	 * Personal allowance with the £100k taper:
	 * lose £1 of allowance for every £2 over £100,000,
	 * fully gone at £125,140 (2026/27).
	 */
	const getPersonalAllowance = (): number => {
		const basic: number = taxSettings.allowance.basic
		const taperThreshold: number = taxSettings.allowance.thresholds.taper
		if (grossIncome <= taperThreshold) {
			return basic
		}
		const reduction: number = (grossIncome - taperThreshold) / 2
		const tapered: number = basic - reduction
		return tapered > 0 ? getAmountRounded(tapered) : 0
	}

	/**
	 * Returns blind person allowance
	 */
	const getBlindAllowance = (): number => {
		if (options.blind === false) {
			return 0
		}
		return taxSettings.allowance.blind
	}

	/**
	 * Returns total tax deductions rounded to 2 decimal places
	 */
	const getTotalTaxDeductions = (): number => {
		let totalTaxDeductions: number =
			getTotalIncomeTax() + getTotalStudentLoanRepayment() + getTotalYearlyNationalInsuranceWithAgeDeductions()
		return getAmountRounded(totalTaxDeductions)
	}

	/**
	 * Returns the total allowances
	 */
	const getTotalAllowances = (): number => getPersonalAllowance() + getBlindAllowance()

	/**
	 * Pension contribution (salary-sacrifice style: reduces taxable income)
	 */
	const pensionAmount: number = (grossIncome / 100) * options.pensionPercentage

	/**
	 * Returns the total taxable income
	 */
	const getTotalTaxableIncome = (): number => {
		let incomeMinusTotalAllowances: number = grossIncome - getTotalAllowances()
		if (incomeMinusTotalAllowances < 0) {
			incomeMinusTotalAllowances = 0
		}
		return incomeMinusTotalAllowances - pensionAmount
	}

	/**
	 * Returns total net pay per year rounded to 2 decimal places
	 */
	const getTotalNetPayPerYear = (): number => {
		let totalNetPay: number = grossIncome - getTotalTaxDeductions() - pensionAmount
		return getAmountRounded(totalNetPay)
	}

	/**
	 * Returns total net pay per month rounded to 2 decimal places
	 */
	const getTotalNetPayPerMonth = (): number => {
		let totalNetPayPerYear: number = getTotalNetPayPerYear()
		return getAmountRounded(totalNetPayPerYear / 12)
	}

	/**
	 * Returns total net pay per week rounded to 2 decimal places
	 */
	const getTotalNetPayPerWeek = (): number => {
		let totalNetPayPerYear: number = getTotalNetPayPerYear()
		return getAmountRounded(totalNetPayPerYear / 52)
	}

	/**
	 * Returns total net pay per day rounded to 2 decimal places
	 */
	const getTotalNetPayPerDay = (): number => {
		let totalNetPayPerYear: number = getTotalNetPayPerYear()
		return getAmountRounded(totalNetPayPerYear / 365)
	}

	const getGrossWeekly = (): number => {
		let grossWeekly: number = grossIncome / 52
		return getAmountRounded(grossWeekly)
	}

	/**
	 * Returns a break down of all income tax bands.
	 * Taxable income is consumed band by band: 20% on the first
	 * £37,700, 40% up to £125,140, 45% above.
	 */
	const getIncomeTaxBreakdown = (): IncomeTaxBreakdown => {
		let totalTaxableIncome: number = getTotalTaxableIncome()
		let incomeTaxRates: IncomeTax = taxSettings.incomeTax
		let rate_0: TaxBreakdownItem = getTotalTaxForRateWithIncome(incomeTaxRates.rate_0, totalTaxableIncome)
		let rate_20: TaxBreakdownItem = getTotalTaxForRateWithIncome(incomeTaxRates.rate_20, rate_0.carry ?? 0)
		let rate_40: TaxBreakdownItem = getTotalTaxForRateWithIncome(incomeTaxRates.rate_40, rate_20.carry ?? 0)
		let rate_45: TaxBreakdownItem = getTotalTaxForRateWithIncome(incomeTaxRates.rate_45, rate_40.carry ?? 0)
		return {
			rate_0,
			rate_20,
			rate_40,
			rate_45
		}
	}

	/**
	 * Scottish income tax for the selected year. Bands are defined on absolute
	 * income, so personal allowance (after taper), blind allowance and pension
	 * relief are applied as a window: [allowances, gross - pension].
	 */
	const getScottishBandTaxes = (): { name: string; rate: number; tax: number }[] => {
		const bottom: number = getTotalAllowances()
		const top: number = grossIncome - pensionAmount
		return taxSettings.scotland.map((band: ScottishBand) => {
			const bandEnd: number = band.end === -1 ? top : band.end
			const taxableInBand: number = Math.max(0, Math.min(top, bandEnd) - Math.max(bottom, band.start))
			return {
				name: band.name,
				rate: band.rate,
				tax: getAmountRounded(taxableInBand * band.rate)
			}
		})
	}

	/**
	 * Returns total income tax rounded to 2 decimal places
	 */
	const getTotalIncomeTax = (): number => {
		if (isScotland) {
			const total: number = getScottishBandTaxes().reduce((sum, band) => sum + band.tax, 0)
			return getAmountRounded(total)
		}
		let incomeTaxBreakdown: IncomeTaxBreakdown = getIncomeTaxBreakdown()
		let totalIncomeTax: number =
			incomeTaxBreakdown.rate_0.tax +
			incomeTaxBreakdown.rate_20.tax +
			incomeTaxBreakdown.rate_40.tax +
			incomeTaxBreakdown.rate_45.tax
		return getAmountRounded(totalIncomeTax)
	}

	/**
	 * Returns the total tax for tax band
	 *
	 * @param taxRate tax rate from settings
	 * @param totalIncome total income before reaching tax band (can be carry left over from last band)
	 */
	const getTotalTaxForRateWithIncome = (taxRate: TaxRate, totalIncome: number): TaxBreakdownItem => {
		let bandWidth: number =
			taxRate.end === -1 ? totalIncome : getAmountRounded(taxRate.end - taxRate.start)
		let totalMinusBand: number = totalIncome - bandWidth
		let carry: number = totalMinusBand > 0 ? totalMinusBand : 0
		if (totalIncome > 0) {
			if (totalIncome >= bandWidth) {
				return {
					tax: getAmountRounded(bandWidth * taxRate.rate),
					carry
				}
			}
			return {
				tax: getAmountRounded(totalIncome * taxRate.rate),
				carry
			}
		}
		return {
			tax: 0,
			carry: carry
		}
	}

	/**
	 * Employee Class 1 NICs for 2026/27 (annualised):
	 * 0% to £12,570 (PT), 8% to £50,270 (UEL), 2% above.
	 * Field names rate_12/rate_2 are kept for backward compatibility.
	 */
	const getNewNationalInsuranceBreakdown = () => {
		const pt = taxSettings.nationalInsurance.rate_12.start
		const uel = taxSettings.nationalInsurance.rate_2.start
		const mainRate = taxSettings.nationalInsurance.rate_12.rate
		const upperRate = taxSettings.nationalInsurance.rate_2.rate

		const abovePt = Math.max(grossIncome - pt, 0)
		const inMainBand = Math.min(abovePt, uel - pt)
		const aboveUel = Math.max(grossIncome - uel, 0)

		const rate_0 = {
			tax: 0
		}
		const rate_12 = {
			tax: getAmountRounded(inMainBand * mainRate)
		}
		const rate_2 = {
			tax: getAmountRounded(aboveUel * upperRate)
		}

		return {
			rate_0,
			rate_12,
			rate_2
		}
	}

	/**
	 * Returns total yearly national insurance rounded to 2 decimal places
	 */
	const getTotalWeeklyNationalInsurance = (): number => {
		let nationalInsuranceBreakdown: NationalInsuranceBreakdown = getNewNationalInsuranceBreakdown()
		let totalNationalInsurance: number =
			nationalInsuranceBreakdown.rate_0.tax +
			nationalInsuranceBreakdown.rate_12.tax +
			nationalInsuranceBreakdown.rate_2.tax
		return getAmountRounded(totalNationalInsurance)
	}

	/**
	 * Returns total yearly national insurance
	 */
	const getTotalYearlyNationalInsurance = (): number => {
		return getTotalWeeklyNationalInsurance()
	}

	/**
	 * No employee NICs once you reach state pension age (66 in 2026/27).
	 */
	const getNationalInsuranceAgeRelatedDeductions = (): number => {
		if (options.age >= taxSettings.nationalInsurance.pensionAge) {
			return getTotalYearlyNationalInsurance()
		}
		return 0
	}

	/**
	 * Returns total yearly national insurance with age deductions
	 */
	const getTotalYearlyNationalInsuranceWithAgeDeductions = (): number => {
		let totalNationalInsurance: number = getTotalYearlyNationalInsurance() - getNationalInsuranceAgeRelatedDeductions()
		return getAmountRounded(totalNationalInsurance)
	}

	/**
	 * Returns student loan repayment plan threshold (2026/27)
	 */
	const getStudentLoanRepaymentThreshold = (): number => {
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_1) {
			return taxSettings.studentLoan.plan_1.threshold
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_2) {
			return taxSettings.studentLoan.plan_2.threshold
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_4) {
			return taxSettings.studentLoan.plan_4.threshold
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_5) {
			return taxSettings.studentLoan.plan_5.threshold
		}
		if (options.studentLoanPlan === StudentLoanPlans.POSTGRADUATE) {
			return taxSettings.studentLoan.postgraduate.threshold
		}
		return 0
	}

	/**
	 * Returns student loan repayment plan rate (9% undergraduate, 6% postgraduate)
	 */
	const getStudentLoanRepaymentRate = (): number => {
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_1) {
			return taxSettings.studentLoan.plan_1.rate
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_2) {
			return taxSettings.studentLoan.plan_2.rate
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_4) {
			return taxSettings.studentLoan.plan_4.rate
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_5) {
			return taxSettings.studentLoan.plan_5.rate
		}
		if (options.studentLoanPlan === StudentLoanPlans.POSTGRADUATE) {
			return taxSettings.studentLoan.postgraduate.rate
		}
		return 0
	}

	const getStudentLoanPlanName = (): string => {
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_1) {
			return "PLAN_1"
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_2) {
			return "PLAN_2"
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_4) {
			return "PLAN_4"
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_5) {
			return "PLAN_5"
		}
		if (options.studentLoanPlan === StudentLoanPlans.POSTGRADUATE) {
			return "POSTGRADUATE"
		}
		return "NO_PLAN"
	}

	/**
	 * Returns income above student loan threshold
	 */
	const getIncomeAboveStudentLoanThreshold = (): number => {
		let studentLoanThreshold: number = getStudentLoanRepaymentThreshold()
		let incomeMinusThreshold: number = grossIncome - studentLoanThreshold
		if (incomeMinusThreshold < 0) {
			return 0
		}
		return incomeMinusThreshold
	}

	/**
	 * Returns total student loan repayment for year rounded to 2 decimal places
	 */
	const getTotalStudentLoanRepayment = (): number => {
		if (options.studentLoanPlan === StudentLoanPlans.NO_PLAN) {
			return 0
		}
		let studentLoanRepaymentTotal: number = getIncomeAboveStudentLoanThreshold() * getStudentLoanRepaymentRate()
		return getAmountRounded(studentLoanRepaymentTotal)
	}

	calculator.getTaxBreakdown = () => {
		const niBreakdown = getNewNationalInsuranceBreakdown()
		const displayNi =
			options.age >= taxSettings.nationalInsurance.pensionAge
				? { rate_0: { tax: 0 }, rate_12: { tax: 0 }, rate_2: { tax: 0 } }
				: niBreakdown
		const scottishBands = getScottishBandTaxes()
		const rUkBreakdown = getIncomeTaxBreakdown()
		// Uniform per-band detail, region-correct in both regions.
		const bands = isScotland
			? scottishBands
			: [
					{ name: "basic", rate: 0.2, tax: rUkBreakdown.rate_20.tax },
					{ name: "higher", rate: 0.4, tax: rUkBreakdown.rate_40.tax },
					{ name: "additional", rate: 0.45, tax: rUkBreakdown.rate_45.tax }
				]
		// Legacy rUK buckets. For Scotland, paye carries the Scottish bands
		// keyed by band name instead.
		const paye: any = isScotland
			? Object.fromEntries(scottishBands.map((band) => [band.name, { rate: band.rate, tax: band.tax }]))
			: rUkBreakdown
		return {
			taxYear: taxSettings.year,
			region,
			netIncome: {
				yearly: getTotalNetPayPerYear(),
				monthly: getTotalNetPayPerMonth(),
				weekly: getTotalNetPayPerWeek(),
				daily: getTotalNetPayPerDay()
			},
			personalAllowance: getPersonalAllowance(),
			paye,
			bands,
			nationalInsurance: displayNi,
			studentLoan: {
				plan: getStudentLoanPlanName(),
				threshold: getStudentLoanRepaymentThreshold(),
				rate: getStudentLoanRepaymentRate(),
				repayment: getTotalStudentLoanRepayment()
			}
		}
	}

	return calculator
}

export default Calculator
