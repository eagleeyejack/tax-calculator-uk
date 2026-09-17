"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAX_SETTINGS = void 0;
// 2022/23 — England, Wales & Northern Ireland
// PA £12,570, basic band £37,700 (HRT £50,270), additional @ £150,000.
// Blind £2,600.
// Employee NICs, annualised for even earnings across the year:
// PT was £9,880 Apr–Jun 2022 then £12,570 Jul 2022–Mar 2023, giving an
// annual equivalent of £11,908 (13 wks × £190 + 39 wks × £242). UEL £50,270.
// Main rate blends 13.25% (6 Apr–5 Nov 2022, incl. Health & Social Care Levy)
// with 12% (6 Nov 2022–5 Apr 2023): (7×13.25 + 5×12)/12 = 12.73%.
// Upper rate 2% above UEL all year.
// Student loans: Plan 1 £20,195, Plan 2 £27,295 (frozen), Plan 4 £25,375,
// Postgraduate £21,000 @ 6%.
// Plan 5 did not exist (stored with 0 rate so no repayment is ever computed).
const additionalRateThreshold = 150000.0;
exports.TAX_SETTINGS = {
    year: "2022/23",
    allowance: {
        basic: 12570.0,
        age_65_74: 12570.0,
        age_75_over: 12570.0,
        blind: 2600.0,
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
        rate_0: { start: 0.0, end: 11908.0, rate: 0.0 },
        rate_12: { start: 11908.0, end: 50270.0, rate: 0.1273 },
        rate_2: { start: 50270.0, end: -1, rate: 0.02 }
    },
    studentLoan: {
        plan_1: { threshold: 20195.0, rate: 0.09 },
        plan_2: { threshold: 27295.0, rate: 0.09 },
        plan_4: { threshold: 25375.0, rate: 0.09 },
        plan_5: { threshold: 25000.0, rate: 0.0 },
        postgraduate: { threshold: 21000.0, rate: 0.06 }
    },
    // Scotland 2022/23: starter–£14,732, basic–£25,688, intermediate–£43,662,
    // higher 41%–£150,000, top 46%.
    scotland: [
        { name: "starter", start: 12570.0, end: 14733.0, rate: 0.19 },
        { name: "basic", start: 14733.0, end: 25689.0, rate: 0.2 },
        { name: "intermediate", start: 25689.0, end: 43663.0, rate: 0.21 },
        { name: "higher", start: 43663.0, end: 150001.0, rate: 0.41 },
        { name: "top", start: 150001.0, end: -1, rate: 0.46 }
    ]
};
