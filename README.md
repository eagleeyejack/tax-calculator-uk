# UK Tax Calculator (2019/20)

This package allows you to calculate UK income tax. It also gives you a detailed breakdown of each part of the tax calculations.

## Installation

You can install the package via the NPM registry.

```
npm install uk-tax-calculator
```

```
yarn add uk-tax-calculator
```

## Setup

You will need to import the package into your project and create an options object with the following options.

```javascript
import TaxCalculator from 'uk-tax-calculator';

const options = {
	age: 26,
	studentLoanPlan: 1,
	blind: false,
	pensionPercentage: 5,
}

const incomeTax = TaxCalculator(60000, options)
```

## Options

### age - Number
This options reprents the age of the person you are calculating the income tax form.

### studentLoanPlan - Number
This option represents the student loan plan of the person you are calculating the income tax for.

```
0 - No plan
1 - Plan 1
2 - Plan 2
```

**Plan 1**
- English and Welsh students who started before 1 September 2012
- all Scottish and Northern Irish students
- You pay back 9% of your income over the minimum amount of **£17,775**.

**Plan 2**
- Plan 2 is for English and Welsh students who started on or after 1 September 2012.
- You pay back 9% of your income over the minimum amount of **£21,000**.

**No plan**
- No repayments will be made as you have no student loan

### blind - Boolean
This options represents whether or not the person is blind. Extra tax allowances are allocated for blind individuals.

#### pensionPercentage - Number
This option represents the percentage of their yearly salary the person is paying into a pension.

## Methods

### getTaxBreakdown
Returns a full breakdown of net income and tax deductions

```javascript
import TaxCalculator from 'uk-tax-calculator';

const incomeTax = incomeTax.getTaxBreakdown()

console.log(incomeTax);
```


Returns
```json
{
	"netIncome": {
		"yearly": 38108.03,
		"monthly": 3175.67,
		"weekly": 732.85,
		"daily": 104.41
	},
	"personalAllowance": 12500,
	"paye": {
		"rate_0": {
		"tax": 0,
		"carry": 45125
		},
		"rate_20": {
		"tax": 7500,
		"carry": 7625
		},
		"rate_40": {
		"tax": 3050,
		"carry": 0
		},
		"rate_45": {
		"tax": 0,
		"carry": 0
		}
	},
	"nationalInsurance": {
		"rate_0": {
		"tax": 0,
		"carry": 987.8499999999999
		},
		"rate_12": {
		"tax": 95.52,
		"carry": 191.8499999999999
		},
		"rate_2": {
		"tax": 3.84,
		"carry": 0
		}
	},
	"studentLoan": {
		"plan": "PLAN_1",
		"threshold": 17775,
		"rate": 0.09,
		"repayment": 3800.25
	}
}
```