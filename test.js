const Calculator = require("./dist/Calculator").default;

const close = (a, b) => Math.abs(a - b) < 0.01;
let fail = 0;
const check = (label, actual, expected) => {
	const ok = close(actual, expected);
	if (!ok) fail++;
	console.log(`${ok ? "PASS" : "FAIL"} ${label}: got ${actual}, want ${expected}`);
};

const base = (plan = 0) => ({ age: 30, studentLoanPlan: plan, blind: false, pensionPercentage: 0 });

// £20k
let r = Calculator(20000, base()).getTaxBreakdown();
check("20k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 1486);
check("20k NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 594.4);
check("20k net", r.netIncome.yearly, 17919.6);
check("20k PA", r.personalAllowance, 12570);

// £60k
r = Calculator(60000, base()).getTaxBreakdown();
check("60k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 11432);
check("60k NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 3210.6);
check("60k net", r.netIncome.yearly, 45357.4);

// £110k (taper zone: PA = 12570 - 5000 = 7570)
r = Calculator(110000, base()).getTaxBreakdown();
check("110k PA", r.personalAllowance, 7570);
check("110k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 33432);
check("110k net", r.netIncome.yearly, 72357.4);

// £130k (PA gone, additional rate)
r = Calculator(130000, base()).getTaxBreakdown();
check("130k PA", r.personalAllowance, 0);
check("130k 45% band", r.paye.rate_45.tax, 2187);
check("130k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 44703);
check("130k net", r.netIncome.yearly, 80686.4);

// Student loans on £35k
check("Plan2 £35k", Calculator(35000, base(2)).getTaxBreakdown().studentLoan.repayment, 505.35);
check("Plan1 £35k", Calculator(35000, base(1)).getTaxBreakdown().studentLoan.repayment, 729);
check("Plan4 £35k", Calculator(35000, base(3)).getTaxBreakdown().studentLoan.repayment, 108.45);
check("Plan5 £35k", Calculator(35000, base(4)).getTaxBreakdown().studentLoan.repayment, 900);
check("Postgrad £35k", Calculator(35000, base(5)).getTaxBreakdown().studentLoan.repayment, 840);

// Pension 5% on £60k
r = Calculator(60000, { age: 30, studentLoanPlan: 0, blind: false, pensionPercentage: 5 }).getTaxBreakdown();
check("60k 5% pension tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 10232);
check("60k 5% pension net", r.netIncome.yearly, 43557.4);

// State pension age: no employee NI
r = Calculator(60000, { age: 66, studentLoanPlan: 0, blind: false, pensionPercentage: 0 }).getTaxBreakdown();
check("66yo NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 0);

// Blind allowance adds £3,250
r = Calculator(20000, { age: 30, studentLoanPlan: 0, blind: true, pensionPercentage: 0 }).getTaxBreakdown();
check("blind PA total", r.personalAllowance, 12570); // personal allowance itself unchanged
check("blind 20k tax", r.paye.rate_20.tax, 836); // (20000-12570-3250)*0.2 = 836

console.log(r.taxYear === "2026/27" ? "PASS taxYear 2026/27" : "FAIL taxYear");
if (r.taxYear !== "2026/27") fail++;

// ---- Backfilled years (explicit taxYear arg) ----

// 22-23 £60k: same income tax, blended 12.73% NI on annualised PT £11,908
r = Calculator(60000, base(), "2022/23").getTaxBreakdown();
check("22-23 tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 11432);
check("22-23 NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 5078.08);
check("22-23 net", r.netIncome.yearly, 43489.92);

// Additional-rate threshold: £150k in 22-23 vs £125,140 in 26-27 (£160k salary)
r = Calculator(160000, base(), "2022/23").getTaxBreakdown();
check("22-23 45% band", r.paye.rate_45.tax, 4500);
check("22-23 £160k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 56960);
r = Calculator(160000, base(), "2026/27").getTaxBreakdown();
check("26-27 45% band", r.paye.rate_45.tax, 15687);
check("26-27 £160k tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 58203);

// 23-24 Plan 1 £30k: (30000-22015)*9%
check("23-24 Plan1 £30k", Calculator(30000, base(1), "2023/24").getTaxBreakdown().studentLoan.repayment, 718.65);
// 23-24 blended 11.5% NI on £60k: 37700*0.115=4335.5 + 194.6
r = Calculator(60000, base(), "2023/24").getTaxBreakdown();
check("23-24 NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 4530.1);

// 24-25 Plan 4 £40k: (40000-31395)*9%
check("24-25 Plan4 £40k", Calculator(40000, base(3), "2024/25").getTaxBreakdown().studentLoan.repayment, 774.45);

// 25-26 Plan 5 not yet repayable (rate 0); Plan 2 £35k: (35000-28470)*9%
check("25-26 Plan5 £35k", Calculator(35000, base(4), "2025/26").getTaxBreakdown().studentLoan.repayment, 0);
check("25-26 Plan2 £35k", Calculator(35000, base(2), "2025/26").getTaxBreakdown().studentLoan.repayment, 587.7);

// 17-18 £30k: PA 11500, 20% on 18500 = 3700; NI 12% on (30000-8164) = 2620.32
r = Calculator(30000, base(), "2017/18").getTaxBreakdown();
check("17-18 tax", r.paye.rate_20.tax + r.paye.rate_40.tax + r.paye.rate_45.tax, 3700);
check("17-18 NI", r.nationalInsurance.rate_12.tax + r.nationalInsurance.rate_2.tax, 2620.32);
check("17-18 net", r.netIncome.yearly, 23679.68);

// 18-19 £30k: PA 11850, 20% on 18150 = 3630; NI 12% on (30000-8424) = 2589.12
r = Calculator(30000, base(), "2018/19").getTaxBreakdown();
check("18-19 tax", r.paye.rate_20.tax, 3630);
check("18-19 NI", r.nationalInsurance.rate_12.tax, 2589.12);

// 21-22 additional threshold still £150k: £130k has no 45% band
r = Calculator(130000, base(), "2021/22").getTaxBreakdown();
check("21-22 45% band", r.paye.rate_45.tax, 0);

// Unknown year throws
let threw = false;
try { Calculator(30000, base(), "2030/31"); } catch (e) { threw = true; }
console.log(threw ? "PASS unknown year throws" : "FAIL unknown year throws");
if (!threw) fail++;

if (fail) { console.log(`${fail} FAILURES`); process.exit(1); }
console.log("ALL TESTS PASSED");
