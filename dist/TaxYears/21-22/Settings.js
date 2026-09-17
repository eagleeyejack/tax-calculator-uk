"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAX_SETTINGS = void 0;
// 2021/22 — England, Wales & Northern Ireland
// PA £12,570, basic band £37,700 (HRT £50,270), additional @ £150,000.
// Blind £2,520. Employee NICs 12% / 2%, PT £9,568, UEL £50,270.
// Student loans: Plan 1 £19,895, Plan 2 £27,295, Plan 4 £25,000
// (Scottish loans reclassified as Plan 4 on 6 Apr 2021),
// Postgraduate £21,000 @ 6%.
// Plan 5 did not exist (stored with 0 rate so no repayment is ever computed).
const personalAllowance = 12570.0;
const basicRateBand = 37700.0;
const additionalRateThreshold = 150000.0;
exports.TAX_SETTINGS = {
    year: "2021/22",
    allowance: {
        basic: personalAllowance,
        age_65_74: personalAllowance,
        age_75_over: personalAllowance,
        blind: 2520.0,
        thresholds: {
            age: 27700.0,
            taper: 100000.0
        }
    },
    incomeTax: {
        rate_0: { start: 0.0, end: 0.0, rate: 0.0 },
        rate_20: { start: 0.0, end: basicRateBand, rate: 0.2 },
        rate_40: { start: basicRateBand, end: additionalRateThreshold, rate: 0.4 },
        rate_45: { start: additionalRateThreshold, end: -1, rate: 0.45 }
    },
    nationalInsurance: {
        pensionAge: 66,
        rate_0: { start: 0.0, end: 9568.0, rate: 0.0 },
        rate_12: { start: 9568.0, end: 50270.0, rate: 0.12 },
        rate_2: { start: 50270.0, end: -1, rate: 0.02 }
    },
    studentLoan: {
        plan_1: { threshold: 19895.0, rate: 0.09 },
        plan_2: { threshold: 27295.0, rate: 0.09 },
        plan_4: { threshold: 25000.0, rate: 0.09 },
        plan_5: { threshold: 25000.0, rate: 0.0 },
        postgraduate: { threshold: 21000.0, rate: 0.06 }
    }
};
