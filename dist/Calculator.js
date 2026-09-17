"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_TAX_YEARS = exports.DEFAULT_TAX_YEAR = exports.TAX_YEARS = void 0;
const rounded_1 = require("./utils/rounded");
const TaxYears_1 = require("./TaxYears");
Object.defineProperty(exports, "TAX_YEARS", { enumerable: true, get: function () { return TaxYears_1.TAX_YEARS; } });
Object.defineProperty(exports, "DEFAULT_TAX_YEAR", { enumerable: true, get: function () { return TaxYears_1.DEFAULT_TAX_YEAR; } });
Object.defineProperty(exports, "SUPPORTED_TAX_YEARS", { enumerable: true, get: function () { return TaxYears_1.SUPPORTED_TAX_YEARS; } });
const Calculator = (grossIncome, options, taxYear = TaxYears_1.DEFAULT_TAX_YEAR) => {
    const taxSettings = TaxYears_1.TAX_YEARS[taxYear];
    if (!taxSettings) {
        throw new Error(`Unknown tax year "${taxYear}". Supported years: ${TaxYears_1.SUPPORTED_TAX_YEARS.join(", ")}`);
    }
    let calculator = {};
    calculator.grossIncome = grossIncome;
    calculator.options = options;
    calculator.taxYear = taxSettings.year;
    /**
     * Age-related personal allowance additions were abolished in April 2016.
     * Kept for backward compatibility — always 0.
     */
    const getAgeRelatedContributions = () => 0;
    /**
     * Kept for backward compatibility — always 0 (see above).
     */
    const getAgeRelatedTaperDeductions = () => 0;
    /**
     * Personal allowance with the £100k taper:
     * lose £1 of allowance for every £2 over £100,000,
     * fully gone at £125,140 (2026/27).
     */
    const getPersonalAllowance = () => {
        const basic = taxSettings.allowance.basic;
        const taperThreshold = taxSettings.allowance.thresholds.taper;
        if (grossIncome <= taperThreshold) {
            return basic;
        }
        const reduction = (grossIncome - taperThreshold) / 2;
        const tapered = basic - reduction;
        return tapered > 0 ? (0, rounded_1.getAmountRounded)(tapered) : 0;
    };
    /**
     * Returns blind person allowance
     */
    const getBlindAllowance = () => {
        if (options.blind === false) {
            return 0;
        }
        return taxSettings.allowance.blind;
    };
    /**
     * Returns total tax deductions rounded to 2 decimal places
     */
    const getTotalTaxDeductions = () => {
        let totalTaxDeductions = getTotalIncomeTax() + getTotalStudentLoanRepayment() + getTotalYearlyNationalInsuranceWithAgeDeductions();
        return (0, rounded_1.getAmountRounded)(totalTaxDeductions);
    };
    /**
     * Returns the total allowances
     */
    const getTotalAllowances = () => getPersonalAllowance() + getBlindAllowance();
    /**
     * Pension contribution (salary-sacrifice style: reduces taxable income)
     */
    const pensionAmount = (grossIncome / 100) * options.pensionPercentage;
    /**
     * Returns the total taxable income
     */
    const getTotalTaxableIncome = () => {
        let incomeMinusTotalAllowances = grossIncome - getTotalAllowances();
        if (incomeMinusTotalAllowances < 0) {
            incomeMinusTotalAllowances = 0;
        }
        return incomeMinusTotalAllowances - pensionAmount;
    };
    /**
     * Returns total net pay per year rounded to 2 decimal places
     */
    const getTotalNetPayPerYear = () => {
        let totalNetPay = grossIncome - getTotalTaxDeductions() - pensionAmount;
        return (0, rounded_1.getAmountRounded)(totalNetPay);
    };
    /**
     * Returns total net pay per month rounded to 2 decimal places
     */
    const getTotalNetPayPerMonth = () => {
        let totalNetPayPerYear = getTotalNetPayPerYear();
        return (0, rounded_1.getAmountRounded)(totalNetPayPerYear / 12);
    };
    /**
     * Returns total net pay per week rounded to 2 decimal places
     */
    const getTotalNetPayPerWeek = () => {
        let totalNetPayPerYear = getTotalNetPayPerYear();
        return (0, rounded_1.getAmountRounded)(totalNetPayPerYear / 52);
    };
    /**
     * Returns total net pay per day rounded to 2 decimal places
     */
    const getTotalNetPayPerDay = () => {
        let totalNetPayPerYear = getTotalNetPayPerYear();
        return (0, rounded_1.getAmountRounded)(totalNetPayPerYear / 365);
    };
    const getGrossWeekly = () => {
        let grossWeekly = grossIncome / 52;
        return (0, rounded_1.getAmountRounded)(grossWeekly);
    };
    /**
     * Returns a break down of all income tax bands.
     * Taxable income is consumed band by band: 20% on the first
     * £37,700, 40% up to £125,140, 45% above.
     */
    const getIncomeTaxBreakdown = () => {
        var _a, _b, _c;
        let totalTaxableIncome = getTotalTaxableIncome();
        let incomeTaxRates = taxSettings.incomeTax;
        let rate_0 = getTotalTaxForRateWithIncome(incomeTaxRates.rate_0, totalTaxableIncome);
        let rate_20 = getTotalTaxForRateWithIncome(incomeTaxRates.rate_20, (_a = rate_0.carry) !== null && _a !== void 0 ? _a : 0);
        let rate_40 = getTotalTaxForRateWithIncome(incomeTaxRates.rate_40, (_b = rate_20.carry) !== null && _b !== void 0 ? _b : 0);
        let rate_45 = getTotalTaxForRateWithIncome(incomeTaxRates.rate_45, (_c = rate_40.carry) !== null && _c !== void 0 ? _c : 0);
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
    const getTotalIncomeTax = () => {
        let incomeTaxBreakdown = getIncomeTaxBreakdown();
        let totalIncomeTax = incomeTaxBreakdown.rate_0.tax +
            incomeTaxBreakdown.rate_20.tax +
            incomeTaxBreakdown.rate_40.tax +
            incomeTaxBreakdown.rate_45.tax;
        return (0, rounded_1.getAmountRounded)(totalIncomeTax);
    };
    /**
     * Returns the total tax for tax band
     *
     * @param taxRate tax rate from settings
     * @param totalIncome total income before reaching tax band (can be carry left over from last band)
     */
    const getTotalTaxForRateWithIncome = (taxRate, totalIncome) => {
        let bandWidth = taxRate.end === -1 ? totalIncome : (0, rounded_1.getAmountRounded)(taxRate.end - taxRate.start);
        let totalMinusBand = totalIncome - bandWidth;
        let carry = totalMinusBand > 0 ? totalMinusBand : 0;
        if (totalIncome > 0) {
            if (totalIncome >= bandWidth) {
                return {
                    tax: (0, rounded_1.getAmountRounded)(bandWidth * taxRate.rate),
                    carry
                };
            }
            return {
                tax: (0, rounded_1.getAmountRounded)(totalIncome * taxRate.rate),
                carry
            };
        }
        return {
            tax: 0,
            carry: carry
        };
    };
    /**
     * Employee Class 1 NICs for 2026/27 (annualised):
     * 0% to £12,570 (PT), 8% to £50,270 (UEL), 2% above.
     * Field names rate_12/rate_2 are kept for backward compatibility.
     */
    const getNewNationalInsuranceBreakdown = () => {
        const pt = taxSettings.nationalInsurance.rate_12.start;
        const uel = taxSettings.nationalInsurance.rate_2.start;
        const mainRate = taxSettings.nationalInsurance.rate_12.rate;
        const upperRate = taxSettings.nationalInsurance.rate_2.rate;
        const abovePt = Math.max(grossIncome - pt, 0);
        const inMainBand = Math.min(abovePt, uel - pt);
        const aboveUel = Math.max(grossIncome - uel, 0);
        const rate_0 = {
            tax: 0
        };
        const rate_12 = {
            tax: (0, rounded_1.getAmountRounded)(inMainBand * mainRate)
        };
        const rate_2 = {
            tax: (0, rounded_1.getAmountRounded)(aboveUel * upperRate)
        };
        return {
            rate_0,
            rate_12,
            rate_2
        };
    };
    /**
     * Returns total yearly national insurance rounded to 2 decimal places
     */
    const getTotalWeeklyNationalInsurance = () => {
        let nationalInsuranceBreakdown = getNewNationalInsuranceBreakdown();
        let totalNationalInsurance = nationalInsuranceBreakdown.rate_0.tax +
            nationalInsuranceBreakdown.rate_12.tax +
            nationalInsuranceBreakdown.rate_2.tax;
        return (0, rounded_1.getAmountRounded)(totalNationalInsurance);
    };
    /**
     * Returns total yearly national insurance
     */
    const getTotalYearlyNationalInsurance = () => {
        return getTotalWeeklyNationalInsurance();
    };
    /**
     * No employee NICs once you reach state pension age (66 in 2026/27).
     */
    const getNationalInsuranceAgeRelatedDeductions = () => {
        if (options.age >= taxSettings.nationalInsurance.pensionAge) {
            return getTotalYearlyNationalInsurance();
        }
        return 0;
    };
    /**
     * Returns total yearly national insurance with age deductions
     */
    const getTotalYearlyNationalInsuranceWithAgeDeductions = () => {
        let totalNationalInsurance = getTotalYearlyNationalInsurance() - getNationalInsuranceAgeRelatedDeductions();
        return (0, rounded_1.getAmountRounded)(totalNationalInsurance);
    };
    /**
     * Returns student loan repayment plan threshold (2026/27)
     */
    const getStudentLoanRepaymentThreshold = () => {
        if (options.studentLoanPlan === 1 /* StudentLoanPlans.PLAN_1 */) {
            return taxSettings.studentLoan.plan_1.threshold;
        }
        if (options.studentLoanPlan === 2 /* StudentLoanPlans.PLAN_2 */) {
            return taxSettings.studentLoan.plan_2.threshold;
        }
        if (options.studentLoanPlan === 3 /* StudentLoanPlans.PLAN_4 */) {
            return taxSettings.studentLoan.plan_4.threshold;
        }
        if (options.studentLoanPlan === 4 /* StudentLoanPlans.PLAN_5 */) {
            return taxSettings.studentLoan.plan_5.threshold;
        }
        if (options.studentLoanPlan === 5 /* StudentLoanPlans.POSTGRADUATE */) {
            return taxSettings.studentLoan.postgraduate.threshold;
        }
        return 0;
    };
    /**
     * Returns student loan repayment plan rate (9% undergraduate, 6% postgraduate)
     */
    const getStudentLoanRepaymentRate = () => {
        if (options.studentLoanPlan === 1 /* StudentLoanPlans.PLAN_1 */) {
            return taxSettings.studentLoan.plan_1.rate;
        }
        if (options.studentLoanPlan === 2 /* StudentLoanPlans.PLAN_2 */) {
            return taxSettings.studentLoan.plan_2.rate;
        }
        if (options.studentLoanPlan === 3 /* StudentLoanPlans.PLAN_4 */) {
            return taxSettings.studentLoan.plan_4.rate;
        }
        if (options.studentLoanPlan === 4 /* StudentLoanPlans.PLAN_5 */) {
            return taxSettings.studentLoan.plan_5.rate;
        }
        if (options.studentLoanPlan === 5 /* StudentLoanPlans.POSTGRADUATE */) {
            return taxSettings.studentLoan.postgraduate.rate;
        }
        return 0;
    };
    const getStudentLoanPlanName = () => {
        if (options.studentLoanPlan === 1 /* StudentLoanPlans.PLAN_1 */) {
            return "PLAN_1";
        }
        if (options.studentLoanPlan === 2 /* StudentLoanPlans.PLAN_2 */) {
            return "PLAN_2";
        }
        if (options.studentLoanPlan === 3 /* StudentLoanPlans.PLAN_4 */) {
            return "PLAN_4";
        }
        if (options.studentLoanPlan === 4 /* StudentLoanPlans.PLAN_5 */) {
            return "PLAN_5";
        }
        if (options.studentLoanPlan === 5 /* StudentLoanPlans.POSTGRADUATE */) {
            return "POSTGRADUATE";
        }
        return "NO_PLAN";
    };
    /**
     * Returns income above student loan threshold
     */
    const getIncomeAboveStudentLoanThreshold = () => {
        let studentLoanThreshold = getStudentLoanRepaymentThreshold();
        let incomeMinusThreshold = grossIncome - studentLoanThreshold;
        if (incomeMinusThreshold < 0) {
            return 0;
        }
        return incomeMinusThreshold;
    };
    /**
     * Returns total student loan repayment for year rounded to 2 decimal places
     */
    const getTotalStudentLoanRepayment = () => {
        if (options.studentLoanPlan === 0 /* StudentLoanPlans.NO_PLAN */) {
            return 0;
        }
        let studentLoanRepaymentTotal = getIncomeAboveStudentLoanThreshold() * getStudentLoanRepaymentRate();
        return (0, rounded_1.getAmountRounded)(studentLoanRepaymentTotal);
    };
    calculator.getTaxBreakdown = () => {
        const niBreakdown = getNewNationalInsuranceBreakdown();
        const displayNi = options.age >= taxSettings.nationalInsurance.pensionAge
            ? { rate_0: { tax: 0 }, rate_12: { tax: 0 }, rate_2: { tax: 0 } }
            : niBreakdown;
        return {
            taxYear: taxSettings.year,
            netIncome: {
                yearly: getTotalNetPayPerYear(),
                monthly: getTotalNetPayPerMonth(),
                weekly: getTotalNetPayPerWeek(),
                daily: getTotalNetPayPerDay()
            },
            personalAllowance: getPersonalAllowance(),
            paye: getIncomeTaxBreakdown(),
            nationalInsurance: displayNi,
            studentLoan: {
                plan: getStudentLoanPlanName(),
                threshold: getStudentLoanRepaymentThreshold(),
                rate: getStudentLoanRepaymentRate(),
                repayment: getTotalStudentLoanRepayment()
            }
        };
    };
    return calculator;
};
exports.default = Calculator;
