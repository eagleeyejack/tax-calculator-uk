import { TaxSettings } from "../../Interfaces"

// 2023/24 — England, Wales & Northern Ireland
// PA £12,570, basic band £37,700 (HRT £50,270).
// Additional rate threshold cut from £150,000 to £125,140 on 6 Apr 2023.
// Blind £2,870.
// Employee NICs, annualised for even earnings across the year:
// main rate blends 12% (6 Apr–31 Dec 2023) with 10% (6 Jan–5 Apr 2024):
// (9×12 + 3×10)/12 = 11.5%. PT £12,570, UEL £50,270, upper rate 2%.
// Student loans: Plan 1 £22,015, Plan 2 £27,295 (frozen), Plan 4 £27,660,
// Postgraduate £21,000 @ 6%.
// Plan 5 did not exist (stored with 0 rate so no repayment is ever computed).

const additionalRateThreshold = 125140.0

export const TAX_SETTINGS: TaxSettings = {
	year: "2023/24",
	allowance: {
		basic: 12570.0,
		age_65_74: 12570.0,
		age_75_over: 12570.0,
		blind: 2870.0,
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
		rate_12: { start: 12570.0, end: 50270.0, rate: 0.115 },
		rate_2: { start: 50270.0, end: -1, rate: 0.02 }
	},
	studentLoan: {
		plan_1: { threshold: 22015.0, rate: 0.09 },
		plan_2: { threshold: 27295.0, rate: 0.09 },
		plan_4: { threshold: 27660.0, rate: 0.09 },
		plan_5: { threshold: 25000.0, rate: 0.0 },
		postgraduate: { threshold: 21000.0, rate: 0.06 }
	},
	// Scotland 2023/24: higher 41%→42%, top 46%→47%, top threshold cut to
	// £125,140. Lower bands frozen (starter–£14,732, basic–£25,688,
	// intermediate–£43,632).
	scotland: [
		{ name: "starter", start: 12570.0, end: 14733.0, rate: 0.19 },
		{ name: "basic", start: 14733.0, end: 25689.0, rate: 0.2 },
		{ name: "intermediate", start: 25689.0, end: 43633.0, rate: 0.21 },
		{ name: "higher", start: 43633.0, end: 125141.0, rate: 0.42 },
		{ name: "top", start: 125141.0, end: -1, rate: 0.47 }
	]
}
