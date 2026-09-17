"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAX_SETTINGS = void 0;
// 2025/26 — England, Wales & Northern Ireland
// PA £12,570, basic band £37,700 (HRT £50,270), additional @ £125,140.
// Blind £3,130. Employee NICs 8% / 2%, PT £12,570, UEL £50,270.
// Student loans: Plan 1 £26,065, Plan 2 £28,470, Plan 4 £32,745,
// Postgraduate £21,000 @ 6%.
// Plan 5 threshold set at £25,000 but first repayments only became due in
// April 2026 (i.e. the 2026/27 year), so the rate is stored as 0 here.
const additionalRateThreshold = 125140.0;
exports.TAX_SETTINGS = {
    year: "2025/26",
    allowance: {
        basic: 12570.0,
        age_65_74: 12570.0,
        age_75_over: 12570.0,
        blind: 3130.0,
        thresholds: {
            age: 27700.0,
            taper: 100000.0
        }
    },
    incomeTax: {
        rate_0: { start: 0.0, end: 0.0, rate: 0.0 },
        rate_20: { start: 0.0, end: 37700.0, rate: 0.2 },
        rate_40: { start: 37700.0, end: additionalRateThreshold, rate: 0.4 },
        rate_45: { start: additionalRateThreshold, end: -1, rate: 0.45 }
    },
    nationalInsurance: {
        pensionAge: 66,
        rate_0: { start: 0.0, end: 12570.0, rate: 0.0 },
        rate_12: { start: 12570.0, end: 50270.0, rate: 0.08 },
        rate_2: { start: 50270.0, end: -1, rate: 0.02 }
    },
    studentLoan: {
        plan_1: { threshold: 26065.0, rate: 0.09 },
        plan_2: { threshold: 28470.0, rate: 0.09 },
        plan_4: { threshold: 32745.0, rate: 0.09 },
        plan_5: { threshold: 25000.0, rate: 0.0 },
        postgraduate: { threshold: 21000.0, rate: 0.06 }
    },
    // Scotland 2025/26: starter £12,571–£15,397, basic–£27,491,
    // intermediate–£43,662, higher 42%–£75,000, advanced 45%–£125,140, top 48%.
    scotland: [
        { name: "starter", start: 12571.0, end: 15398.0, rate: 0.19 },
        { name: "basic", start: 15398.0, end: 27492.0, rate: 0.2 },
        { name: "intermediate", start: 27492.0, end: 43663.0, rate: 0.21 },
        { name: "higher", start: 43663.0, end: 75001.0, rate: 0.42 },
        { name: "advanced", start: 75001.0, end: 125141.0, rate: 0.45 },
        { name: "top", start: 125141.0, end: -1, rate: 0.48 }
    ]
};
