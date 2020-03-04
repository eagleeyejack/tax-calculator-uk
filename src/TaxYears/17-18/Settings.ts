import { TaxSettings } from './Interfaces';

export const TAX_SETTINGS: TaxSettings = {
	year: '2017/18',
	allowance: {
		basic: 11500.0,
		age_65_74: 11500.0,
		age_75_over: 11500.0,
		blind: 2320.0,
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
			end: 33500.0,
			rate: 0.2
		},
		rate_40: {
			start: 33500.0,
			end: 150000.0,
			rate: 0.4
		},
		rate_45: {
			start: 150000,
			end: -1,
			rate: 0.45
		}
	},
	nationalInsurance: {
		pensionAge: 65,
		rate_0: {
			start: 0.0,
			end: 157.0,
			rate: 0.0
		},
		rate_12: {
			start: 157.0,
			end: 866.0,
			rate: 0.12
		},
		rate_2: {
			start: 866.0,
			end: -1,
			rate: 0.02
		}
	},
	studentLoan: {
		plan_1: {
			threshold: 17775.0,
			rate: 0.09
		},
		plan_2: {
			threshold: 21000.0,
			rate: 0.09
		}
	}
};
