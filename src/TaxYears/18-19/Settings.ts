import { TaxSettings } from "../../Interfaces"

// 2018/19 — England, Wales & Northern Ireland
// PA £11,850, basic band £34,500 (HRT £46,350), additional @ £150,000.
// Blind £2,390. Employee NICs 12% / 2%, PT £8,424, UEL £46,384.
// Student loans: Plan 1 £18,330, Plan 2 £25,000 (Scottish loans used Plan 1
// thresholds — Plan 4 did not exist yet), Postgraduate £21,000 @ 6%.
// Plan 5 did not exist (stored with 0 rate so no repayment is ever computed).

const personalAllowance = 11850.0
const basicRateBand = 34500.0
const additionalRateThreshold = 150000.0

export const TAX_SETTINGS: TaxSettings = {
	year: "2018/19",
	allowance: {
		basic: personalAllowance,
		age_65_74: personalAllowance,
		age_75_over: personalAllowance,
		blind: 2390.0,
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
		pensionAge: 65,
		rate_0: { start: 0.0, end: 8424.0, rate: 0.0 },
		rate_12: { start: 8424.0, end: 46384.0, rate: 0.12 },
		rate_2: { start: 46384.0, end: -1, rate: 0.02 }
	},
	studentLoan: {
		plan_1: { threshold: 18330.0, rate: 0.09 },
		plan_2: { threshold: 25000.0, rate: 0.09 },
		plan_4: { threshold: 18330.0, rate: 0.09 },
		plan_5: { threshold: 25000.0, rate: 0.0 },
		postgraduate: { threshold: 21000.0, rate: 0.06 }
	}
}
