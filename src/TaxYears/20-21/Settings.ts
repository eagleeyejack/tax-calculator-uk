import { TaxSettings } from "../../Interfaces"

// 2020/21 — England, Wales & Northern Ireland
// PA £12,500, basic band £37,500 (HRT £50,000), additional @ £150,000.
// Blind £2,500. Employee NICs 12% / 2%, PT £9,500, UEL £50,000.
// Student loans: Plan 1 £19,390, Plan 2 £26,575 (Scottish loans used Plan 1
// thresholds — Plan 4 did not exist yet), Postgraduate £21,000 @ 6%.
// Plan 5 did not exist (stored with 0 rate so no repayment is ever computed).

const personalAllowance = 12500.0
const basicRateBand = 37500.0
const additionalRateThreshold = 150000.0

export const TAX_SETTINGS: TaxSettings = {
	year: "2020/21",
	allowance: {
		basic: personalAllowance,
		age_65_74: personalAllowance,
		age_75_over: personalAllowance,
		blind: 2500.0,
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
		rate_0: { start: 0.0, end: 9500.0, rate: 0.0 },
		rate_12: { start: 9500.0, end: 50000.0, rate: 0.12 },
		rate_2: { start: 50000.0, end: -1, rate: 0.02 }
	},
	studentLoan: {
		plan_1: { threshold: 19390.0, rate: 0.09 },
		plan_2: { threshold: 26575.0, rate: 0.09 },
		plan_4: { threshold: 19390.0, rate: 0.09 },
		plan_5: { threshold: 25000.0, rate: 0.0 },
		postgraduate: { threshold: 21000.0, rate: 0.06 }
	},
	// Scotland 2020/21: starter–£14,585, basic–£25,158, intermediate–£43,430,
	// higher 41%–£150,000, top 46%.
	scotland: [
		{ name: "starter", start: 12500.0, end: 14586.0, rate: 0.19 },
		{ name: "basic", start: 14586.0, end: 25159.0, rate: 0.2 },
		{ name: "intermediate", start: 25159.0, end: 43431.0, rate: 0.21 },
		{ name: "higher", start: 43431.0, end: 150001.0, rate: 0.41 },
		{ name: "top", start: 150001.0, end: -1, rate: 0.46 }
	]
}
