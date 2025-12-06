#!/usr/bin/env tsx

/**
 * FIRE (Financial Independence Retire Early) Calculator
 *
 * This script calculates how much you need to save per month to achieve financial independence.
 *
 * HOW TO USE:
 * 1. Edit the constants below with your personal financial information
 * 2. Run with: pnpm run fire
 * 3. Review your savings requirements
 *
 * FORMULAS USED:
 * - Nest egg needed = (desired monthly income × 12) ÷ withdrawal rate
 * - Real return rate = (1 + interest rate) ÷ (1 + inflation rate) - 1
 * - Monthly savings = [nest egg - future value of current savings] × real rate ÷ [(1+real rate)^months - 1]
 */

// === YOUR INPUTS - EDIT THESE VALUES ===
const CURRENT_NET_WORTH = 900_000; // Your current net worth in dollars
const INTEREST_RATE = 0.12; // Expected annual return rate (7% = 0.07)
const INFLATION_RATE = 0.057; // Expected annual inflation rate (3% = 0.03)
const DESIRED_MONTHLY_INCOME = 25_000; // Monthly income wanted in retirement (today's dollars)
const WITHDRAWAL_RATE = 0.05; // Safe withdrawal rate (4% rule = 0.04)
const BIRTH_YEAR = 1994; // Your birth year
const RETIREMENT_AGE = 46; // Age at which you want to retire
// ======================================

interface FIREInputs {
  currentNetWorth: number;
  interestRate: number; // Annual interest rate (e.g., 0.07 for 7%)
  inflationRate: number; // Annual inflation rate (e.g., 0.03 for 3%)
  desiredMonthlyIncome: number; // Monthly income wanted in retirement (in today's dollars)
  withdrawalRate: number; // Safe withdrawal rate (e.g., 0.04 for 4% rule)
  birthYear: number;
  retirementAge: number;
}

interface FIREResults {
  yearsUntilRetirement: number;
  nestEggNeeded: number; // Total nest egg needed in today's dollars
  realReturnRate: number; // Annual real return rate
  monthlySavingsNeeded: number;
  totalSavingsNeeded: number; // Additional savings needed beyond current net worth
}

function calculateFIRE(inputs: FIREInputs): FIREResults {
  const {
    currentNetWorth,
    interestRate,
    inflationRate,
    desiredMonthlyIncome,
    withdrawalRate,
    birthYear,
    retirementAge,
  } = inputs;

  // Calculate years until retirement
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;
  const yearsUntilRetirement = retirementAge - currentAge;

  if (yearsUntilRetirement <= 0) {
    throw new Error("You are already at or past retirement age!");
  }

  // Calculate nest egg needed in today's dollars
  // Annual income needed = desiredMonthlyIncome * 12
  // Nest egg = annual income / withdrawal rate
  const annualIncomeNeeded = desiredMonthlyIncome * 12;
  const nestEggNeeded = annualIncomeNeeded / withdrawalRate;

  // Calculate real return rate (nominal return minus inflation)
  const realReturnRate = (1 + interestRate) / (1 + inflationRate) - 1;

  // Calculate monthly real return rate
  const monthlyRealReturnRate = realReturnRate / 12;

  // Calculate number of months until retirement
  const monthsUntilRetirement = yearsUntilRetirement * 12;

  // Calculate future value of current net worth in real terms
  const futureValueCurrentNetWorth =
    currentNetWorth *
    Math.pow(1 + monthlyRealReturnRate, monthsUntilRetirement);

  // Calculate additional savings needed
  const totalSavingsNeeded = nestEggNeeded - futureValueCurrentNetWorth;

  if (totalSavingsNeeded <= 0) {
    return {
      yearsUntilRetirement,
      nestEggNeeded,
      realReturnRate,
      monthlySavingsNeeded: 0,
      totalSavingsNeeded: 0,
    };
  }

  // Calculate monthly savings needed using future value of annuity formula
  // FV = PMT × [(1+r)^n - 1]/r
  // PMT = FV × r / [(1+r)^n - 1]
  const monthlySavingsNeeded =
    (totalSavingsNeeded * monthlyRealReturnRate) /
    (Math.pow(1 + monthlyRealReturnRate, monthsUntilRetirement) - 1);

  return {
    yearsUntilRetirement,
    nestEggNeeded,
    realReturnRate,
    monthlySavingsNeeded,
    totalSavingsNeeded,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function getUserInputs(): FIREInputs {
  return {
    currentNetWorth: CURRENT_NET_WORTH,
    interestRate: INTEREST_RATE,
    inflationRate: INFLATION_RATE,
    desiredMonthlyIncome: DESIRED_MONTHLY_INCOME,
    withdrawalRate: WITHDRAWAL_RATE,
    birthYear: BIRTH_YEAR,
    retirementAge: RETIREMENT_AGE,
  };
}

function displayResults(inputs: FIREInputs, results: FIREResults) {
  console.log(
    "╔══════════════════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                     FIRE CALCULATOR RESULTS                                ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════════╝\n"
  );

  console.log("📊 YOUR INPUTS:");
  console.log(
    `   Current net worth: ${formatCurrency(inputs.currentNetWorth)}`
  );
  console.log(
    `   Expected return rate: ${formatPercentage(inputs.interestRate)}`
  );
  console.log(`   Inflation rate: ${formatPercentage(inputs.inflationRate)}`);
  console.log(
    `   Desired monthly retirement income: ${formatCurrency(
      inputs.desiredMonthlyIncome
    )}`
  );
  console.log(
    `   Safe withdrawal rate: ${formatPercentage(inputs.withdrawalRate)}`
  );
  console.log(
    `   Birth year: ${inputs.birthYear} (retiring at age ${inputs.retirementAge})`
  );
  console.log(`   Years until retirement: ${results.yearsUntilRetirement}`);

  console.log("\n💡 CALCULATIONS:");
  console.log(`   Nest egg needed: ${formatCurrency(results.nestEggNeeded)}`);
  console.log(
    `   Real return rate: ${formatPercentage(results.realReturnRate)}`
  );
  console.log(
    `   Additional savings needed: ${formatCurrency(
      results.totalSavingsNeeded
    )}`
  );

  if (results.monthlySavingsNeeded === 0) {
    console.log(
      "\n🎉 CONGRATULATIONS! You already have enough saved to retire!"
    );
  } else {
    console.log("\n💰 SAVINGS REQUIRED:");
    console.log(`   Monthly: ${formatCurrency(results.monthlySavingsNeeded)}`);
    console.log(
      `   Annual: ${formatCurrency(results.monthlySavingsNeeded * 12)}`
    );
  }
}

// Main function
function main() {
  console.log("🔥 FIRE (Financial Independence Retire Early) Calculator\n");

  try {
    const inputs = getUserInputs();
    const results = calculateFIRE(inputs);
    displayResults(inputs, results);
  } catch (error) {
    console.error(
      `\n❌ Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

// Run the calculator
main();
