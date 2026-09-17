"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAX_SETTINGS = void 0;
// 2024/25 — England, Wales & Northern Ireland
// PA £12,570, basic band £37,700 (HRT £50,270), additional @ £125,140.
// Blind £3,070.
// Employee NICs 8% / 2% all year (main rate cut from 10% to 8% on 6 Apr 2024).
// PT £12,570, UEL £50,270.
// Student loans: Plan 1 £24,990, Plan 2 £27,295 (frozen), Plan 4 £31,395,
// Postgraduate £21,000 @ 6%.
// Plan 5 did not exist (stored with 0 rate so no repayment is ever computed).
const additionalRateThreshold = 125140.0;
exports.TAX_SETTINGS = {
    year: "2024/25",
    allowance: {
        basic: 12570.0,
        age_65_74: 12570.0,
        age_75_over: 12570.0,
        blind: 3070.0,
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
        plan_1: { threshold: 24990.0, rate: 0.09 },
        plan_2: { threshold: 27295.0, rate: 0.09 },
        plan_4: { threshold: 31395.0, rate: 0.09 },
        plan_5: { threshold: 25000.0, rate: 0.0 },
        postgraduate: { threshold: 21000.0, rate: 0.06 }
    },
    // Scotland 2024/25: advanced 45% band (£75,001–£125,140) introduced,
    // top rate 48%. Lower thresholds as in 2025/26.
    scotland: [
        { name: "starter", start: 12571.0, end: 15398.0, rate: 0.19 },
        { name: "basic", start: 15398.0, end: 27492.0, rate: 0.2 },
        { name: "intermediate", start: 27492.0, end: 43663.0, rate: 0.21 },
        { name: "higher", start: 43663.0, end: 75001.0, rate: 0.42 },
        { name: "advanced", start: 75001.0, end: 125141.0, rate: 0.45 },
        { name: "top", start: 125141.0, end: -1, rate: 0.48 }
    ]
};
