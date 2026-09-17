# 💷 Tax Calculator UK (2017/18 – 2026/27) 💷

UK income tax breakdown based on a yearly salary. Defaults to the **2026/27 tax year**, with backfilled figures for every tax year back to **2017/18** (England, Wales & Northern Ireland).

## Installation

```
npm install tax-calculator-uk
```

## Setup

```javascript
import TaxCalculator from "tax-calculator-uk"

const options = {
	age: 26,
	studentLoanPlan: 2,
	blind: false,
	pensionPercentage: 5
}

const incomeTax = TaxCalculator(60000, options)
console.log(incomeTax.getTaxBreakdown())
```

## Tax year selection

Pass a tax year as the third argument. Defaults to `"2026/27"`.

```javascript
const lastYear = TaxCalculator(60000, options, "2024/25")
console.log(lastYear.getTaxBreakdown().taxYear) // "2024/25"

import { SUPPORTED_TAX_YEARS } from "tax-calculator-uk"
console.log(SUPPORTED_TAX_YEARS)
// ["2017/18", "2018/19", "2019/20", "2020/21", "2021/22",
//  "2022/23", "2023/24", "2024/25", "2025/26", "2026/27"]
```

An unknown year throws with the list of supported years. Years with mid-year
NIC changes (2022/23, 2023/24) use documented annualised blended rates — see
the per-year files under `src/TaxYears/` for sources and working.

## Options

### age - Number

Age of the person. At/above state pension age (66) no employee National Insurance is due.

### studentLoanPlan - Number

```
0 - No plan
1 - Plan 1  (£26,900 threshold, 9%)
2 - Plan 2  (£29,385 threshold, 9%)
3 - Plan 4, Scotland (£33,795 threshold, 9%) — new in v2
4 - Plan 5  (£25,000 threshold, 9%) — new in v2
5 - Postgraduate loan (£21,000 threshold, 6%) — new in v2
```

Values `0`/`1`/`2` behave exactly as in v1.

### blind - Boolean

Blind person's allowance (£3,250 in 2026/27) is added to the personal allowance.

### pensionPercentage - Number

Percentage of gross salary paid into a pension. Reduces taxable income.

## getTaxBreakdown

```javascript
const breakdown = TaxCalculator(60000, {
	age: 26,
	studentLoanPlan: 2,
	blind: false,
	pensionPercentage: 5
}).getTaxBreakdown()
```

```json
{
	"taxYear": "2026/27",
	"netIncome": { "yearly": 40802.05, "monthly": 3400.17, "weekly": 784.65, "daily": 111.79 },
	"personalAllowance": 12570,
	"paye": {
		"rate_0": { "tax": 0, "carry": 44430 },
		"rate_20": { "tax": 7540, "carry": 6730 },
		"rate_40": { "tax": 2692, "carry": 0 },
		"rate_45": { "tax": 0, "carry": 0 }
	},
	"nationalInsurance": {
		"rate_0": { "tax": 0 },
		"rate_12": { "tax": 3016 },
		"rate_2": { "tax": 194.6 }
	},
	"studentLoan": { "plan": "PLAN_2", "threshold": 29385, "rate": 0.09, "repayment": 2755.35 }
}
```

## 2026/27 figures used

| Measure | Value |
|---|---|
| Personal allowance | £12,570 (tapers £1 per £2 over £100,000, gone at £125,140) |
| Basic rate 20% | first £37,700 of taxable income (to £50,270) |
| Higher rate 40% | £50,271 – £125,140 |
| Additional rate 45% | above £125,140 |
| Blind person's allowance | £3,250 |
| Employee NICs | 8% £12,570–£50,270, 2% above; none at/above state pension age (66) |
| Student loans | Plan 1 £26,900 · Plan 2 £29,385 · Plan 4 £33,795 · Plan 5 £25,000 @ 9%; Postgraduate £21,000 @ 6% |

Thresholds frozen to April 2031 per Budget 2025 (employee NICs re-rated for 2026/27).

🚧 Figures are a rough estimation for England, Wales & Northern Ireland (Scotland has different income tax bands). 🚧
