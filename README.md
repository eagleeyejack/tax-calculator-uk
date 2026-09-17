# 💷 Tax Calculator UK (2017/18 – 2026/27) 💷

UK income tax breakdown based on a yearly salary. Covers **England, Wales, Northern Ireland and Scotland**, with figures for every tax year from **2017/18 to 2026/27**. Defaults to 2026/27.

## Installation

```
npm install tax-calculator-uk
```

## Quick start

```javascript
import TaxCalculator from "tax-calculator-uk"

const options = {
	age: 26,
	studentLoanPlan: 2,
	blind: false,
	pensionPercentage: 5
}

console.log(TaxCalculator(60000, options).getTaxBreakdown())
```

## Options

### age - Number

Age of the person. At/above state pension age (66, 65 in 2017/18–2018/19) no employee National Insurance is due.

### studentLoanPlan - Number

```
0 - No plan
1 - Plan 1
2 - Plan 2
3 - Plan 4 (Scotland)
4 - Plan 5 (England, repayments from April 2026)
5 - Postgraduate loan
```

Values `0`/`1`/`2` behave exactly as in v1. Thresholds are per tax year — see the table below.

### blind - Boolean

Blind person's allowance is added to the personal allowance (£2,320 in 2017/18, rising to £3,250 in 2026/27).

### pensionPercentage - Number

Percentage of gross salary paid into a pension via **salary sacrifice**: reduces taxable income; National Insurance is still charged on gross pay.

### region - String (optional)

`"england-wales-ni"` (default) or `"scotland"`. Scottish income tax bands apply to non-savings, non-dividend income — savings and dividend income is taxed at rest-of-UK rates, which this package does not model (see Limitations).

```javascript
const scottish = TaxCalculator(60000, { ...options, region: "scotland" }, "2026/27")
console.log(scottish.getTaxBreakdown().bands)
// [
//   { name: "starter", rate: 0.19, tax: 753.73 },
//   { name: "basic", rate: 0.2, tax: 2597.8 },
//   { name: "intermediate", rate: 0.21, tax: 2968.56 },
//   { name: "higher", rate: 0.42, tax: 6861.54 },
//   { name: "advanced", rate: 0.45, tax: 0 },
//   { name: "top", rate: 0.48, tax: 0 }
// ]
```

## Tax year selection

Pass a tax year as the third argument. Defaults to `"2026/27"`.

```javascript
const lastYear = TaxCalculator(60000, options, "2024/25")
console.log(lastYear.getTaxBreakdown().taxYear) // "2024/25"

import { SUPPORTED_TAX_YEARS } from "tax-calculator-uk"
// ["2017/18", "2018/19", "2019/20", "2020/21", "2021/22",
//  "2022/23", "2023/24", "2024/25", "2025/26", "2026/27"]
```

An unknown year throws with the list of supported years. Years with mid-year National Insurance changes (2022/23, 2023/24) use documented annualised blended rates — see the per-year files under `src/TaxYears/` for sources and working.

## getTaxBreakdown

```javascript
TaxCalculator(60000, {
	age: 26,
	studentLoanPlan: 2,
	blind: false,
	pensionPercentage: 5
}).getTaxBreakdown()
```

```json
{
	"taxYear": "2026/27",
	"region": "england-wales-ni",
	"netIncome": { "yearly": 40802.05, "monthly": 3400.17, "weekly": 784.65, "daily": 111.79 },
	"personalAllowance": 12570,
	"paye": {
		"rate_0": { "tax": 0, "carry": 44430 },
		"rate_20": { "tax": 7540, "carry": 6730 },
		"rate_40": { "tax": 2692, "carry": 0 },
		"rate_45": { "tax": 0, "carry": 0 }
	},
	"bands": [
		{ "name": "basic", "rate": 0.2, "tax": 7540 },
		{ "name": "higher", "rate": 0.4, "tax": 2692 },
		{ "name": "additional", "rate": 0.45, "tax": 0 }
	],
	"nationalInsurance": {
		"rate_0": { "tax": 0 },
		"rate_12": { "tax": 3016 },
		"rate_2": { "tax": 194.6 }
	},
	"studentLoan": { "plan": "PLAN_2", "threshold": 29385, "rate": 0.09, "repayment": 2755.35 }
}
```

`paye` keeps the legacy rest-of-UK buckets. When `region` is `"scotland"`, `paye` instead holds the Scottish bands keyed by band name (`starter`, `basic`, `intermediate`, `higher`, `advanced`, `top`), and `bands` is the uniform array to consume in either region. National Insurance and student loans are UK-wide, so those sections are identical in both regions.

## Figures used

Rest of UK (personal allowance / basic band / additional-rate threshold / blind allowance / employee NICs / student loan thresholds P1 · P2 · P4 · P5 · PG):

| Year | PA | Basic band | Add'l @ | Blind | NICs | P1 | P2 | P4 | P5 | PG |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026/27 | 12,570 | 37,700 | 125,140 | 3,250 | 8% / 2% | 26,900 | 29,385 | 33,795 | 25,000 | 21,000 |
| 2025/26 | 12,570 | 37,700 | 125,140 | 3,130 | 8% / 2% | 26,065 | 28,470 | 32,745 | — | 21,000 |
| 2024/25 | 12,570 | 37,700 | 125,140 | 3,070 | 8% / 2% | 24,990 | 27,295 | 31,395 | — | 21,000 |
| 2023/24 | 12,570 | 37,700 | 125,140 | 2,870 | 11.5% / 2%¹ | 22,015 | 27,295 | 27,660 | — | 21,000 |
| 2022/23 | 12,570 | 37,700 | 150,000 | 2,600 | 12.73% / 2%¹ | 20,195 | 27,295 | 25,375 | — | 21,000 |
| 2021/22 | 12,570 | 37,700 | 150,000 | 2,520 | 12% / 2% | 19,895 | 27,295 | 25,000 | — | 21,000 |
| 2020/21 | 12,500 | 37,500 | 150,000 | 2,500 | 12% / 2% | 19,390 | 26,575 | = P1 | — | 21,000 |
| 2019/20 | 12,500 | 37,500 | 150,000 | 2,450 | 12% / 2% | 18,935 | 25,725 | = P1 | — | 21,000 |
| 2018/19 | 11,850 | 34,500 | 150,000 | 2,390 | 12% / 2% | 18,330 | 25,000 | = P1 | — | 21,000 |
| 2017/18 | 11,500 | 33,500 | 150,000 | 2,320 | 12% / 2% | 17,775 | 21,000 | = P1 | — | 21,000 |

¹ Annualised blended rate for even earnings across a year with mid-year rate changes (13.25%→12% in Nov 2022; 12%→10% in Jan 2024). NI thresholds: PT £12,570 / UEL £50,270 except 2022/23 (PT £11,908 annualised) and earlier years — see `src/TaxYears/`.

Scotland (starter / basic / intermediate / higher / advanced / top):

| Year | Starter | Basic | Intermediate | Higher | Advanced | Top |
|---|---|---|---|---|---|---|
| 2026/27 | 19% –16,537 | 20% –29,526 | 21% –43,662 | 42% –75,000 | 45% –125,140 | 48% |
| 2025/26 | 19% –15,397 | 20% –27,491 | 21% –43,662 | 42% –75,000 | 45% –125,140 | 48% |
| 2024/25 | 19% –15,397 | 20% –27,491 | 21% –43,662 | 42% –75,000 | 45% –125,140 | 48% |
| 2023/24 | 19% –14,732 | 20% –25,688 | 21% –43,632 | 42% –125,140 | — | 47% |
| 2022/23 | 19% –14,732 | 20% –25,688 | 21% –43,662 | 41% –150,000 | — | 46% |
| 2021/22 | 19% –14,667 | 20% –25,296 | 21% –43,662 | 41% –150,000 | — | 46% |
| 2020/21 | 19% –14,585 | 20% –25,158 | 21% –43,430 | 41% –150,000 | — | 46% |
| 2019/20 | 19% –14,549 | 20% –24,944 | 21% –43,430 | 41% –150,000 | — | 46% |
| 2018/19 | 19% –13,850 | 20% –24,000 | 21% –43,430 | 41% –150,000 | — | 46% |
| 2017/18 | — | 20% –43,000 | — | 40% –150,000 | — | 45% |

Personal allowance tapers £1 per £2 over £100,000 in all nations and years (fully gone at £125,140 from 2021/22; £125,000 in 2019/20–2020/21; £123,000 in 2017/18; £121,850 in 2018/19).

## Limitations

Rough estimation, not tax advice. Assumes a standard tax code with full personal allowance. Doesn't model Marriage Allowance transfers, pension annual-allowance charges, benefits-in-kind, or the High Income Child Benefit Charge. Scottish bands apply to non-savings, non-dividend income only. Figures frozen per Budget policy to 2030/31 unless stated — check gov.uk for the current year.
