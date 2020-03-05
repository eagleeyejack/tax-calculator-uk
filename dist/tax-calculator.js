(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TaxCalculator"] = factory();
	else
		root["TaxCalculator"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var rounded_1 = __webpack_require__(1);
var Settings_1 = __webpack_require__(2);
var Calculator = function Calculator(grossIncome, options) {
    var taxSettings = Settings_1.TAX_SETTINGS;
    var calculator = {};
    calculator.grossIncome = grossIncome;
    calculator.options = options;
    /**
    * Returns the age related contributions
    */
    var getAgeRelatedContributions = function getAgeRelatedContributions() {
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
    var getAgeRelatedTaperDeductions = function getAgeRelatedTaperDeductions() {
        var incomeMinusTaperThreshold = grossIncome - taxSettings.allowance.thresholds.taper;
        if (incomeMinusTaperThreshold < 0) {
            return 0;
        }
        var halfIncomeMinusTaperThreshold = incomeMinusTaperThreshold / 2;
        var ageRelatedContributions = getAgeRelatedContributions();
        if (halfIncomeMinusTaperThreshold > ageRelatedContributions) {
            return ageRelatedContributions;
        }
        return halfIncomeMinusTaperThreshold;
    };
    /**
    * Returns the total taper deductions
    */
    var getTaperDeductions = function getTaperDeductions() {
        var incomeMinusPensionContributions = grossIncome - grossIncome - grossIncome / 100 * 5;
        var incomeMinusPensionMinusTaperThreshold = incomeMinusPensionContributions - taxSettings.allowance.thresholds.taper;
        if (incomeMinusPensionMinusTaperThreshold < 0) {
            return 0;
        }
        var halfIncomeMinusPensionMinusTaperThreshold = incomeMinusPensionMinusTaperThreshold / 2;
        var allowanceAfterAgeAdjust = getAllowanceAfterAgeAdjust();
        if (halfIncomeMinusPensionMinusTaperThreshold > allowanceAfterAgeAdjust) {
            return allowanceAfterAgeAdjust;
        }
        return halfIncomeMinusPensionMinusTaperThreshold;
    };
    /**
    * Returns personal allowance after adjusting for age
    */
    var getAllowanceAfterAgeAdjust = function getAllowanceAfterAgeAdjust() {
        var ageAllowance = taxSettings.allowance.basic + getAgeRelatedContributions();
        return ageAllowance - getAgeRelatedTaperDeductions();
    };
    /**
    * Returns the allowed personal allowance
    */
    var getPersonalAllowance = function getPersonalAllowance() {
        return getAllowanceAfterAgeAdjust() - getTaperDeductions();
    };
    /**
    * Returns blind person allowance
    */
    var getBlindAllowance = function getBlindAllowance() {
        if (options.blind === false) {
            return 0;
        }
        return taxSettings.allowance.blind;
    };
    /**
    * Returns total tax deductions rounded to 2 decimal places
    */
    var getTotalTaxDeductions = function getTotalTaxDeductions() {
        var totalTaxDeductions = getTotalIncomeTax() + getTotalStudentLoanRepayment() + getTotalYearlyNationalInsuranceWithAgeDeductions();
        return rounded_1.getAmountRounded(totalTaxDeductions);
    };
    /**
    * Returns the total allowances
    */
    var getTotalAllowances = function getTotalAllowances() {
        return getPersonalAllowance() + getBlindAllowance();
    };
    /**
    * Pension amount
    */
    var pensionAmount = (grossIncome - getTotalAllowances()) / 100 * options.pensionPercentage;
    /**
    * Returns the total taxable income
    */
    var getTotalTaxableIncome = function getTotalTaxableIncome() {
        var incomeMinusTotalAllowances = grossIncome - getTotalAllowances();
        return incomeMinusTotalAllowances - pensionAmount;
    };
    /**
    * Returns total net pay per year rounded to 2 decimal places
    */
    var getTotalNetPayPerYear = function getTotalNetPayPerYear() {
        var totalNetPay = grossIncome - getTotalTaxDeductions() - pensionAmount;
        return rounded_1.getAmountRounded(totalNetPay);
    };
    /**
    * Returns total net pay per month rounded to 2 decimal places
    */
    var getTotalNetPayPerMonth = function getTotalNetPayPerMonth() {
        var totalNetPayPerYear = getTotalNetPayPerYear();
        return rounded_1.getAmountRounded(totalNetPayPerYear / 12);
    };
    /**
    * Returns total net pay per week rounded to 2 decimal places
    */
    var getTotalNetPayPerWeek = function getTotalNetPayPerWeek() {
        var totalNetPayPerYear = getTotalNetPayPerYear();
        return rounded_1.getAmountRounded(totalNetPayPerYear / 52);
    };
    /**
    * Returns total net pay per day rounded to 2 decimal places
    */
    var getTotalNetPayPerDay = function getTotalNetPayPerDay() {
        var totalNetPayPerYear = getTotalNetPayPerYear();
        return rounded_1.getAmountRounded(totalNetPayPerYear / 365);
    };
    var getGrossWeekly = function getGrossWeekly() {
        var grossWeekly = grossIncome / 52;
        return rounded_1.getAmountRounded(grossWeekly);
    };
    /**
    * Returns a break down of all income tax bands
    */
    var getIncomeTaxBreakdown = function getIncomeTaxBreakdown() {
        var totalTaxableIncome = getTotalTaxableIncome();
        var incomeTaxRates = taxSettings.incomeTax;
        var rate_0 = getTotalTaxForRateWithIncome(incomeTaxRates.rate_0, totalTaxableIncome);
        var rate_20 = getTotalTaxForRateWithIncome(incomeTaxRates.rate_20, rate_0.carry);
        var rate_40 = getTotalTaxForRateWithIncome(incomeTaxRates.rate_40, rate_20.carry);
        var rate_45 = getTotalTaxForRateWithIncome(incomeTaxRates.rate_45, rate_40.carry);
        return {
            rate_0: rate_0,
            rate_20: rate_20,
            rate_40: rate_40,
            rate_45: rate_45
        };
    };
    /**
    * Returns total income tax rounded to 2 decimal places
    */
    var getTotalIncomeTax = function getTotalIncomeTax() {
        var incomeTaxBreakdown = getIncomeTaxBreakdown();
        var totalIncomeTax = incomeTaxBreakdown.rate_0.tax + incomeTaxBreakdown.rate_20.tax + incomeTaxBreakdown.rate_40.tax + incomeTaxBreakdown.rate_45.tax;
        return rounded_1.getAmountRounded(totalIncomeTax);
    };
    /**
    * Returns the total tax for tax band
    *
    * @param taxRate tax rate from settings
    * @param totalIncome total income before reaching tax band (can be carry left over from last band)
    */
    var getTotalTaxForRateWithIncome = function getTotalTaxForRateWithIncome(taxRate, totalIncome) {
        var incomeTaxRateDifference = taxRate.end === -1 ? totalIncome : rounded_1.getAmountRounded(taxRate.end - taxRate.start);
        var totalMinusDifference = totalIncome - incomeTaxRateDifference;
        var carry = totalMinusDifference > 0 ? totalMinusDifference : 0;
        if (totalIncome > 0) {
            if (totalIncome >= incomeTaxRateDifference) {
                return {
                    tax: rounded_1.getAmountRounded(incomeTaxRateDifference * taxRate.rate),
                    carry: carry
                };
            }
            return {
                tax: rounded_1.getAmountRounded(totalIncome * taxRate.rate),
                carry: carry
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
    var getNationalInsuranceBreakdown = function getNationalInsuranceBreakdown() {
        var grossWeeklyIncome = getGrossWeekly();
        var nationalInsuranceBands = taxSettings.nationalInsurance;
        var rate_0 = getTotalTaxForRateWithIncome(nationalInsuranceBands.rate_0, grossWeeklyIncome);
        var rate_12 = getTotalTaxForRateWithIncome(nationalInsuranceBands.rate_12, rate_0.carry);
        var rate_2 = getTotalTaxForRateWithIncome(nationalInsuranceBands.rate_2, rate_12.carry);
        return {
            rate_0: rate_0,
            rate_12: rate_12,
            rate_2: rate_2
        };
    };
    /**
    * Returns total weekly national insurance rounded to 2 decimal places
    */
    var getTotalWeeklyNationalInsurance = function getTotalWeeklyNationalInsurance() {
        var nationalInsuranceBreakdown = getNationalInsuranceBreakdown();
        var totalWeeklyNationalInsurance = nationalInsuranceBreakdown.rate_0.tax + nationalInsuranceBreakdown.rate_12.tax + nationalInsuranceBreakdown.rate_2.tax;
        return rounded_1.getAmountRounded(totalWeeklyNationalInsurance);
    };
    /**
    * Returns total yearly national insurance
    */
    var getTotalYearlyNationalInsurance = function getTotalYearlyNationalInsurance() {
        var totalWeeklyNationalInsurance = getTotalWeeklyNationalInsurance() * 52;
        return rounded_1.getAmountRounded(totalWeeklyNationalInsurance);
    };
    /**
    * Returns national insurance age related deductions
    */
    var getNationalInsuranceAgeRelatedDeductions = function getNationalInsuranceAgeRelatedDeductions() {
        var totalWeeklingNationalInsurance = getTotalWeeklyNationalInsurance();
        if (options.age >= taxSettings.nationalInsurance.pensionAge) {
            return getTotalYearlyNationalInsurance();
        }
        return 0;
    };
    /**
    * Returns total yearly national insurance with age deductions
    */
    var getTotalYearlyNationalInsuranceWithAgeDeductions = function getTotalYearlyNationalInsuranceWithAgeDeductions() {
        var totalNationalInsurance = getTotalYearlyNationalInsurance() - getNationalInsuranceAgeRelatedDeductions();
        return rounded_1.getAmountRounded(totalNationalInsurance);
    };
    /**
    * Returns student loan replayment plan threshold
    */
    var getStudentLoanRepaymentThreshold = function getStudentLoanRepaymentThreshold() {
        if (options.studentLoanPlan === 1 /* PLAN_1 */) {
                return taxSettings.studentLoan.plan_1.threshold;
            }
        if (options.studentLoanPlan === 2 /* PLAN_2 */) {
                return taxSettings.studentLoan.plan_2.threshold;
            }
        return 0;
    };
    /**
    * Returns student loan replayment plan rate
    */
    var getStudentLoanRepaymentRate = function getStudentLoanRepaymentRate() {
        if (options.studentLoanPlan === 1 /* PLAN_1 */) {
                return taxSettings.studentLoan.plan_1.rate;
            }
        if (options.studentLoanPlan === 2 /* PLAN_2 */) {
                return taxSettings.studentLoan.plan_2.rate;
            }
        return 0;
    };
    /**
    * Returns income above student loan threshold
    */
    var getIncomeAboveStudentLoanThreshold = function getIncomeAboveStudentLoanThreshold() {
        var studentLoanThreshold = getStudentLoanRepaymentThreshold();
        var incomeMinusThreshold = grossIncome - studentLoanThreshold;
        if (incomeMinusThreshold < 0) {
            return 0;
        }
        return incomeMinusThreshold;
    };
    /**
    * Returns total student loan replayment for year rounded to 2 decimal places
    */
    var getTotalStudentLoanRepayment = function getTotalStudentLoanRepayment() {
        if (options.studentLoanPlan === 0 /* NO_PLAN */) {
                return 0;
            }
        var studentLoanRepaymentTotal = getIncomeAboveStudentLoanThreshold() * getStudentLoanRepaymentRate();
        return rounded_1.getAmountRounded(studentLoanRepaymentTotal);
    };
    calculator.getTaxBreakdown = function () {
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
                plan: options.studentLoanPlan === 1 /* PLAN_1 */ ? 'PLAN_1' : options.studentLoanPlan === 2 /* PLAN_2 */ ? 'PLAN_2' : 'NO_PLAN',
                threshold: getStudentLoanRepaymentThreshold(),
                rate: getStudentLoanRepaymentRate(),
                repayment: getTotalStudentLoanRepayment()
            }
        };
    };
    return calculator;
};
exports.default = Calculator;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
exports.getAmountRounded = function (amount) {
  return Math.round(amount * 100) / 100;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
// PAYE
var payeBasic = 12500.0;
var payeMid = 37500.0;
var payeHigh = 150000;
// Allowance
var blind = 2450.0;
// NI
var niLow = 166.0;
var niHigh = 962.0;
exports.TAX_SETTINGS = {
    year: '2019/20',
    allowance: {
        basic: payeBasic,
        age_65_74: payeBasic,
        age_75_over: payeBasic,
        blind: blind,
        thresholds: {
            age: 27700.0,
            taper: 100000.0
        }
    },
    incomeTax: {
        rate_0: {
            start: 0.0,
            end: 0.0,
            rate: 0.0
        },
        rate_20: {
            start: 0.0,
            end: payeMid,
            rate: 0.2
        },
        rate_40: {
            start: payeMid,
            end: payeHigh,
            rate: 0.4
        },
        rate_45: {
            start: payeHigh,
            end: -1,
            rate: 0.45
        }
    },
    nationalInsurance: {
        pensionAge: 68,
        rate_0: {
            start: 0.0,
            end: niLow,
            rate: 0.0
        },
        rate_12: {
            start: niLow,
            end: niHigh,
            rate: 0.12
        },
        rate_2: {
            start: niHigh,
            end: -1,
            rate: 0.02
        }
    },
    studentLoan: {
        plan_1: {
            threshold: 17775.0,
            rate: 0.09
        },
        plan_2: {
            threshold: 21000.0,
            rate: 0.09
        }
    }
};

/***/ })
/******/ ]);
});