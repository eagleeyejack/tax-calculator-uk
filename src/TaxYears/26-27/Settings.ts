import { TaxSettings } from "../../Interfaces"

// 2026/27 — England, Wales & Northern Ireland (frozen to April 2031 per Budget 2025)
// Sources: gov.uk (personal allowance / NICs rates 2026-27), gov.uk student loan thresholds
//
// Income tax: PA £12,570, basic band £37,700 @ 20% (to £50,270),
// higher @ 40% to £125,140, additional @ 45% above.
// PA tapers £1 per £2 over £100,000 — fully gone at £125,140.
// Blind person's allowance £3,250 (uprated from £3,130 in 2025/26).
// Age-related allowances were abolished in 2016 — kept at basic for compat.
//
// Employee Class 1 NICs: 0% to £12,570 (PT), 8% to £50,270 (UEL), 2% above.
// State pension age 66 in 2026/27 — no employee NICs at/above it.
//
// Student loans 2026/27: Plan 1 £26,900, Plan 2 £29,385, Plan 4 £33,795,
// Plan 5 £25,000 (repayments from April 2026), Postgraduate £21,000 @ 6%.
// All undergraduate plans repay at 9% above threshold.

const personalAllowance = 12570.0
const basicRateBand = 37700.0
const higherRateThreshold = personalAllowance + basicRateBand // 50270
const additionalRateThreshold = 125140.0
const blind = 3250.0

export const TAX_SETTINGS: TaxSettings = {
	year: "2026/27",
	allowance: {
		basic: personalAllowance,
		age_65_74: personalAllowance,
		age_75_over: personalAllowance,
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
			end: basicRateBand,
			rate: 0.2
		},
		rate_40: {
			start: basicRateBand,
			end: additionalRateThreshold,
			rate: 0.4
		},
		rate_45: {
			start: additionalRateThreshold,
			end: -1,
			rate: 0.45
		}
	},
	nationalInsurance: {
		pensionAge: 66,
		rate_0: {
			start: 0.0,
			end: personalAllowance,
			rate: 0.0
		},
		rate_12: {
			start: personalAllowance,
			end: higherRateThreshold,
			rate: 0.08
		},
		rate_2: {
			start: higherRateThreshold,
			end: -1,
			rate: 0.02
		}
	},
	studentLoan: {
		plan_1: {
			threshold: 26900.0,
			rate: 0.09
		},
		plan_2: {
			threshold: 29385.0,
			rate: 0.09
		},
		plan_4: {
			threshold: 33795.0,
			rate: 0.09
		},
		plan_5: {
			threshold: 25000.0,
			rate: 0.09
		},
		postgraduate: {
			threshold: 21000.0,
			rate: 0.06
		}
	},
	// Scotland 2026/27 (gov.scot Budget Jan 2026, gov.uk Scottish Income Tax).
	// Published as £12,571–£16,537 etc. assuming standard PA; stored half-open.
	scotland: [
		{ name: "starter", start: 12571.0, end: 16538.0, rate: 0.19 },
		{ name: "basic", start: 16538.0, end: 29527.0, rate: 0.2 },
		{ name: "intermediate", start: 29527.0, end: 43663.0, rate: 0.21 },
		{ name: "higher", start: 43663.0, end: 75001.0, rate: 0.42 },
		{ name: "advanced", start: 75001.0, end: 125141.0, rate: 0.45 },
		{ name: "top", start: 125141.0, end: -1, rate: 0.48 }
	]
}
