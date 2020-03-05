import {
	TaxSettings,
	StudentLoanPlans,
	CalculatorOptions,
	TaxRate,
	IncomeTax,
	IncomeTaxBreakdown,
	TaxBreakdownItem,
	NationalInsurance,
	NationalInsuranceBreakdown
} from './Interfaces';

import { getAmountRounded } from './utils/Rounded';
import { TAX_SETTINGS } from './TaxYears/19-20/Settings';

const Calculator = (grossIncome: number, options: CalculatorOptions) => {
	const taxSettings: TaxSettings = TAX_SETTINGS;
	let calculator: any

	console.log(grossIncome)


	/**
   * Returns the age related contributions
   */
	const getAgeRelatedContributions = (): number => {
		if (options.age < 65) {
			return 0;
		}
		if (options.age < 75) {
			return taxSettings.allowance.basic - taxSettings.allowance.age_65_74;
		}
		return taxSettings.allowance.basic - taxSettings.allowance.age_75_over;
	};

	/**
   * Returns the age related taper deductions
   */
	const getAgeRelatedTaperDeductions = (): number => {
		let incomeMinusTaperThreshold: number = grossIncome - taxSettings.allowance.thresholds.taper;
		if (incomeMinusTaperThreshold < 0) {
			return 0;
		}
		let halfIncomeMinusTaperThreshold: number = incomeMinusTaperThreshold / 2;
		let ageRelatedContributions: number = getAgeRelatedContributions();
		if (halfIncomeMinusTaperThreshold > ageRelatedContributions) {
			return ageRelatedContributions;
		}
		return halfIncomeMinusTaperThreshold;
	};

	/**
   * Returns the total taper deductions
   */
	const getTaperDeductions = (): number => {
		let incomeMinusPensionContributions: number = grossIncome - grossIncome - grossIncome / 100 * 5;
		let incomeMinusPensionMinusTaperThreshold: number =
			incomeMinusPensionContributions - taxSettings.allowance.thresholds.taper;
		if (incomeMinusPensionMinusTaperThreshold < 0) {
			return 0;
		}
		let halfIncomeMinusPensionMinusTaperThreshold: number = incomeMinusPensionMinusTaperThreshold / 2;
		let allowanceAfterAgeAdjust: number = getAllowanceAfterAgeAdjust();
		if (halfIncomeMinusPensionMinusTaperThreshold > allowanceAfterAgeAdjust) {
			return allowanceAfterAgeAdjust;
		}
		return halfIncomeMinusPensionMinusTaperThreshold;
	};

	/**
   * Returns personal allowance after adjusting for age
   */
	const getAllowanceAfterAgeAdjust = (): number => {
		let ageAllowance: number = taxSettings.allowance.basic + getAgeRelatedContributions();
		return ageAllowance - getAgeRelatedTaperDeductions();
	};

	/**
   * Returns the allowed personal allowance
   */
	const getPersonalAllowance = (): number => {
		return getAllowanceAfterAgeAdjust() - getTaperDeductions();
	};

	/**
   * Returns blind person allowance
   */
	const getBlindAllowance = (): number => {
		if (options.blind === false) {
			return 0;
		}
		return taxSettings.allowance.blind;
	};

	/**
   * Returns total tax deductions rounded to 2 decimal places
   */
	const getTotalTaxDeductions = (): number => {
		let totalTaxDeductions: number =
			getTotalIncomeTax() + getTotalStudentLoanRepayment() + getTotalYearlyNationalInsuranceWithAgeDeductions();
		return getAmountRounded(totalTaxDeductions);
	};

	/**
   * Returns the total allowances
   */
	const getTotalAllowances = (): number => getPersonalAllowance() + getBlindAllowance();

	/**
   * Pension amount 
   */

	const pensionAmount: number = (grossIncome - getTotalAllowances()) / 100 * options.pensionPercentage;

	/**
   * Returns the total taxable income
   */
	const getTotalTaxableIncome = (): number => {
		let incomeMinusTotalAllowances: number = grossIncome - getTotalAllowances();

		return incomeMinusTotalAllowances - pensionAmount;
	};

	/**
   * Returns total net pay per year rounded to 2 decimal places
   */
	const getTotalNetPayPerYear = (): number => {
		let totalNetPay: number = grossIncome - getTotalTaxDeductions() - pensionAmount;
		return getAmountRounded(totalNetPay);
	};

	/**
   * Returns total net pay per month rounded to 2 decimal places
   */
	const getTotalNetPayPerMonth = (): number => {
		let totalNetPayPerYear: number = getTotalNetPayPerYear();
		return getAmountRounded(totalNetPayPerYear / 12);
	};

	/**
   * Returns total net pay per week rounded to 2 decimal places
   */
	const getTotalNetPayPerWeek = (): number => {
		let totalNetPayPerYear: number = getTotalNetPayPerYear();
		return getAmountRounded(totalNetPayPerYear / 52);
	};

	/**
   * Returns total net pay per day rounded to 2 decimal places
   */
	const getTotalNetPayPerDay = (): number => {
		let totalNetPayPerYear: number = getTotalNetPayPerYear();
		return getAmountRounded(totalNetPayPerYear / 365);
	};

	const getGrossWeekly = (): number => {
		let grossWeekly: number = grossIncome / 52;
		return getAmountRounded(grossWeekly);
	};

	/**
   * Returns a break down of all income tax bands
   */
	const getIncomeTaxBreakdown = (): IncomeTaxBreakdown => {
		let totalTaxableIncome: number = getTotalTaxableIncome();
		let incomeTaxRates: IncomeTax = taxSettings.incomeTax;
		let rate_0: TaxBreakdownItem = getTotalTaxForRateWithIncome(incomeTaxRates.rate_0, totalTaxableIncome);
		let rate_20: TaxBreakdownItem = getTotalTaxForRateWithIncome(incomeTaxRates.rate_20, rate_0.carry);
		let rate_40: TaxBreakdownItem = getTotalTaxForRateWithIncome(incomeTaxRates.rate_40, rate_20.carry);
		let rate_45: TaxBreakdownItem = getTotalTaxForRateWithIncome(incomeTaxRates.rate_45, rate_40.carry);
		return {
			rate_0,
			rate_20,
			rate_40,
			rate_45
		};
	};

	/**
   * Returns total income tax rounded to 2 decimal places
   */
	const getTotalIncomeTax = (): number => {
		let incomeTaxBreakdown: IncomeTaxBreakdown = getIncomeTaxBreakdown();
		let totalIncomeTax: number =
			incomeTaxBreakdown.rate_0.tax +
			incomeTaxBreakdown.rate_20.tax +
			incomeTaxBreakdown.rate_40.tax +
			incomeTaxBreakdown.rate_45.tax;
		return getAmountRounded(totalIncomeTax);
	};

	/**
   * Returns the total tax for tax band
   * 
   * @param taxRate tax rate from settings
   * @param totalIncome total income before reaching tax band (can be carry left over from last band)
   */
	const getTotalTaxForRateWithIncome = (taxRate: TaxRate, totalIncome: number): TaxBreakdownItem => {
		let incomeTaxRateDifference: number =

				taxRate.end === -1 ? totalIncome :
				getAmountRounded(taxRate.end - taxRate.start);
		let totalMinusDifference: number = totalIncome - incomeTaxRateDifference;
		let carry: number =

				totalMinusDifference > 0 ? totalMinusDifference :
				0;
		if (totalIncome > 0) {
			if (totalIncome >= incomeTaxRateDifference) {
				return {
					tax: getAmountRounded(incomeTaxRateDifference * taxRate.rate),
					carry
				};
			}
			return {
				tax: getAmountRounded(totalIncome * taxRate.rate),
				carry
			};
		}
		return {
			tax: 0,
			carry: carry
		};
	};

	/**
   * Returns a breakdown for all national insurance bands
   */
	const getNationalInsuranceBreakdown = (): NationalInsuranceBreakdown => {
		let grossWeeklyIncome: number = getGrossWeekly();
		let nationalInsuranceBands: NationalInsurance = taxSettings.nationalInsurance;
		let rate_0: TaxBreakdownItem = getTotalTaxForRateWithIncome(nationalInsuranceBands.rate_0, grossWeeklyIncome);
		let rate_12: TaxBreakdownItem = getTotalTaxForRateWithIncome(nationalInsuranceBands.rate_12, rate_0.carry);
		let rate_2: TaxBreakdownItem = getTotalTaxForRateWithIncome(nationalInsuranceBands.rate_2, rate_12.carry);
		return {
			rate_0,
			rate_12,
			rate_2
		};
	};

	/**
   * Returns total weekly national insurance rounded to 2 decimal places
   */
	const getTotalWeeklyNationalInsurance = (): number => {
		let nationalInsuranceBreakdown: NationalInsuranceBreakdown = getNationalInsuranceBreakdown();
		let totalWeeklyNationalInsurance: number =
			nationalInsuranceBreakdown.rate_0.tax +
			nationalInsuranceBreakdown.rate_12.tax +
			nationalInsuranceBreakdown.rate_2.tax;
		return getAmountRounded(totalWeeklyNationalInsurance);
	};

	/**
   * Returns total yearly national insurance
   */
	const getTotalYearlyNationalInsurance = (): number => {
		let totalWeeklyNationalInsurance: number = getTotalWeeklyNationalInsurance() * 52;
		return getAmountRounded(totalWeeklyNationalInsurance);
	};

	/**
   * Returns national insurance age related deductions
   */
	const getNationalInsuranceAgeRelatedDeductions = (): number => {
		let totalWeeklingNationalInsurance: number = getTotalWeeklyNationalInsurance();
		if (options.age >= taxSettings.nationalInsurance.pensionAge) {
			return getTotalYearlyNationalInsurance();
		}
		return 0;
	};

	/**
   * Returns total yearly national insurance with age deductions
   */
	const getTotalYearlyNationalInsuranceWithAgeDeductions = (): number => {
		let totalNationalInsurance: number =
			getTotalYearlyNationalInsurance() - getNationalInsuranceAgeRelatedDeductions();
		return getAmountRounded(totalNationalInsurance);
	};

	/**
   * Returns student loan replayment plan threshold
   */
	const getStudentLoanRepaymentThreshold = (): number => {
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_1) {
			return taxSettings.studentLoan.plan_1.threshold;
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_2) {
			return taxSettings.studentLoan.plan_2.threshold;
		}
		return 0;
	};

	/**
   * Returns student loan replayment plan rate
   */
	const getStudentLoanRepaymentRate = (): number => {
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_1) {
			return taxSettings.studentLoan.plan_1.rate;
		}
		if (options.studentLoanPlan === StudentLoanPlans.PLAN_2) {
			return taxSettings.studentLoan.plan_2.rate;
		}
		return 0;
	};

	/**
   * Returns income above student loan threshold
   */
	const getIncomeAboveStudentLoanThreshold = (): number => {
		let studentLoanThreshold: number = getStudentLoanRepaymentThreshold();
		let incomeMinusThreshold: number = grossIncome - studentLoanThreshold;
		if (incomeMinusThreshold < 0) {
			return 0;
		}
		return incomeMinusThreshold;
	};

	/**
   * Returns total student loan replayment for year rounded to 2 decimal places
   */
	const getTotalStudentLoanRepayment = (): number => {
		if (options.studentLoanPlan === StudentLoanPlans.NO_PLAN) {
			return 0;
		}
		let studentLoanRepaymentTotal: number = getIncomeAboveStudentLoanThreshold() * getStudentLoanRepaymentRate();
		return getAmountRounded(studentLoanRepaymentTotal);
	};

	calculator.getTaxBreakdown = () => {
		return {
			netIncome: {
				yearly: getTotalNetPayPerYear(),
				monthly: getTotalNetPayPerMonth(),
				weekly: getTotalNetPayPerWeek(),
				daily: getTotalNetPayPerDay()
			},
			personalAllowance: getPersonalAllowance(),
			paye: getIncomeTaxBreakdown(),
			nationalInsurance: getNationalInsuranceBreakdown(),
			studentLoan: {
				plan:

						options.studentLoanPlan === StudentLoanPlans.PLAN_1 ? 'PLAN_1' :
						options.studentLoanPlan === StudentLoanPlans.PLAN_2 ? 'PLAN_2' :
						'NO_PLAN',
				threshold: getStudentLoanRepaymentThreshold(),
				rate: getStudentLoanRepaymentRate(),
				repayment: getTotalStudentLoanRepayment()
			}
		};
	};

	return calculator;
};

export default Calculator;
