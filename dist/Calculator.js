"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_TAX_YEARS = exports.DEFAULT_TAX_YEAR = exports.TAX_YEARS = void 0;
const years_1 = require("./years");
Object.defineProperty(exports, "TAX_YEARS", { enumerable: true, get: function () { return years_1.YEARS; } });
Object.defineProperty(exports, "DEFAULT_TAX_YEAR", { enumerable: true, get: function () { return years_1.DEFAULT_TAX_YEAR; } });
Object.defineProperty(exports, "SUPPORTED_TAX_YEARS", { enumerable: true, get: function () { return years_1.SUPPORTED_TAX_YEARS; } });
const r = (n) => Math.round(n * 100) / 100;
const PLAN_NAMES = ["NO_PLAN", "PLAN_1", "PLAN_2", "PLAN_4", "PLAN_5", "POSTGRADUATE"];
const Calculator = (grossIncome, options, taxYear = years_1.DEFAULT_TAX_YEAR) => {
    var _a, _b, _c;
    const year = years_1.YEARS[taxYear];
    if (!year) {
        throw new Error(`Unknown tax year "${taxYear}". Supported years: ${years_1.SUPPORTED_TAX_YEARS.join(", ")}`);
    }
    const region = (_a = options.region) !== null && _a !== void 0 ? _a : "england-wales-ni";
    const isScotland = region === "scotland";
    // Effective tax-free amount: PA tapered £1 per £2 over £100k, plus blind allowance.
    const allowance = (grossIncome > 100000 ? Math.max(0, year.pa - (grossIncome - 100000) / 2) : year.pa) +
        (options.blind ? year.blind : 0);
    // Salary-sacrifice pension reduces taxable income; NI stays on gross.
    const pension = (grossIncome / 100) * options.pensionPercentage;
    const taxable = Math.max(0, grossIncome - allowance - pension);
    // Slice taxable income through [width, rate] bands (width 0 = remainder).
    const slice = (bands) => {
        let rest = taxable;
        return bands.map(([width, rate]) => {
            const take = width === 0 ? Math.max(0, rest) : Math.min(Math.max(0, rest), width);
            rest -= take;
            return r(take * rate);
        });
    };
    const rUkBands = [[year.bb, 0.2], [year.at - year.bb, 0.4], [0, 0.45]];
    const scotBands = year.scot.map(([, width, rate]) => [width, rate]);
    const bandTaxes = slice(isScotland ? scotBands : rUkBands);
    const totalIncomeTax = r(bandTaxes.reduce((sum, tax) => sum + tax, 0));
    // Legacy rUK buckets with carry, byte-identical to v1/v2 maths.
    const rUkBreakdown = () => {
        const b20 = Math.min(taxable, year.bb);
        const b40 = Math.min(Math.max(0, taxable - year.bb), year.at - year.bb);
        const b45 = Math.max(0, taxable - year.at);
        return {
            rate_0: { tax: 0, carry: taxable },
            rate_20: { tax: r(b20 * 0.2), carry: taxable - b20 },
            rate_40: { tax: r(b40 * 0.4), carry: b45 },
            rate_45: { tax: r(b45 * 0.45), carry: 0 }
        };
    };
    // Employee NICs on gross; none at/above state pension age.
    const niMain = options.age >= year.penAge ? 0 : r(Math.min(Math.max(0, grossIncome - year.ni[1]), year.ni[2] - year.ni[1]) * year.ni[0]);
    const niUpper = options.age >= year.penAge ? 0 : r(Math.max(0, grossIncome - year.ni[2]) * 0.02);
    const niBreakdown = {
        rate_0: { tax: 0 },
        rate_12: { tax: niMain },
        rate_2: { tax: niUpper }
    };
    // Student loans: 9% undergrad (plan 5 rate varies), 6% postgraduate.
    const plan = options.studentLoanPlan;
    const slThresholds = [0, year.sl[0], year.sl[1], year.sl[2], year.sl[3], year.sl[4]];
    const slRates = [0, 0.09, 0.09, 0.09, year.sl[5], 0.06];
    const slRepayment = r(Math.max(0, grossIncome - ((_b = slThresholds[plan]) !== null && _b !== void 0 ? _b : 0)) * ((_c = slRates[plan]) !== null && _c !== void 0 ? _c : 0));
    const deductions = r(totalIncomeTax + niMain + niUpper + slRepayment);
    const netYearly = r(grossIncome - deductions - pension);
    const scotDetail = () => Object.fromEntries(year.scot.map(([name, , rate], i) => [name, { rate, tax: bandTaxes[i] }]));
    return {
        grossIncome,
        options,
        taxYear,
        region,
        getTaxBreakdown: () => {
            var _a, _b, _c;
            return ({
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
                    plan: (_a = PLAN_NAMES[plan]) !== null && _a !== void 0 ? _a : "NO_PLAN",
                    threshold: (_b = slThresholds[plan]) !== null && _b !== void 0 ? _b : 0,
                    rate: (_c = slRates[plan]) !== null && _c !== void 0 ? _c : 0,
                    repayment: slRepayment
                }
            });
        }
    };
};
exports.default = Calculator;
