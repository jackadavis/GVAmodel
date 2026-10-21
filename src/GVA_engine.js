// Core P&L engine. Four stories drive each scenario:
//   1. Revenue growth          - revenue for each year (from the chart)
//   2. Productivity target     - revenue per employee, % vs baseline, entered for each year
//   3. Non-labour cost change  - a list of drivers (+ = costs up, - = savings); the app passes one
//                                driver with a pp of revenue for each year (the non-labour cost saving)
//   4. Depreciation            - added to GVA only (see getDepreciationK in GVA_modeler.js)
// All money values are in £k. Index 0 is the baseline year, 1-3 are the forecast years.

// Straight line from the baseline (0) to the Year 3 target (used by fixed £ non-labour drivers)
function spreadLinear(targetY3) {
  return [0, targetY3 / 3, (targetY3 * 2) / 3, targetY3];
}

// A driver's non-labour change in £k for each year.
//   variable: scales with revenue. Year 3 target given as targetPp (pp of revenue) or as
//             amount (£k at baseline revenue, converted to pp of baseline revenue).
//   fixed:    a £k amount that does not move with revenue. profile 'linear' phases it in by
//             Year 3; profile 'flat' applies the full amount every forecast year.
function driverAmounts(driver, revenues) {
  const revenue0 = revenues[0] || 0;
  const amount = Number(driver.amount) || 0;
  if (driver.type === 'fixed') {
    return driver.profile === 'flat'
      ? revenues.map((_, i) => (i === 0 ? 0 : amount))
      : spreadLinear(amount);
  }
  // pathPp gives the pp of revenue for each year directly ([baseline, Y1, Y2, Y3])
  if (Array.isArray(driver.pathPp)) {
    return revenues.map((revenue, i) => (i === 0 ? 0 : revenue * ((Number(driver.pathPp[i]) || 0) / 100)));
  }
  const targetPp = driver.targetPp !== undefined
    ? Number(driver.targetPp) || 0
    : (revenue0 ? (amount / revenue0) * 100 : 0);
  const ppPath = spreadLinear(targetPp);
  return revenues.map((revenue, i) => revenue * (ppPath[i] / 100));
}

function computeScenarioPnl({
  revenues,
  baseEmployees,
  basePayroll,
  baseNetProfit,
  productivityPathPct = [0, 0, 0, 0],
  nonLabourDrivers = [],
  manualEmployees = null
}) {
  const revenue0 = revenues[0] || 0;
  const averageCost = baseEmployees > 0 ? basePayroll / baseEmployees : 0;
  const baseProductivity = baseEmployees > 0 ? revenue0 / baseEmployees : 0;
  // Baseline net profit is after depreciation, so baseline depreciation sits inside non-labour costs
  const baseNonLabourPct = revenue0 ? ((revenue0 - basePayroll - baseNetProfit) / revenue0) * 100 : 0;
  // Productivity target for each year, % vs baseline ([baseline, Y1, Y2, Y3]; the baseline is always 0)
  const productivityPath = revenues.map((_, i) => (i === 0 ? 0 : Number((productivityPathPct || [])[i]) || 0));
  const driverPaths = (nonLabourDrivers || []).map(driver => ({ name: driver.name, amounts: driverAmounts(driver, revenues) }));

  return revenues.map((revenue, i) => {
    const targetProductivity = baseProductivity * (1 + productivityPath[i] / 100);
    const targetEmployees = targetProductivity > 0 ? revenue / targetProductivity : 0;

    let employees;
    if (i === 0) {
      employees = baseEmployees;
    } else if (manualEmployees) {
      employees = Math.max(0, Number(manualEmployees[i]) || 0);
    } else {
      // Whole people only: the nearest headcount to the productivity target
      employees = Math.max(0, Math.round(targetEmployees));
    }

    const payroll = employees * averageCost;
    const nonLabourBreakdown = driverPaths.map(d => ({ name: d.name, amount: d.amounts[i] }));
    const nonLabourChange = nonLabourBreakdown.reduce((sum, d) => sum + d.amount, 0);
    const nonLabour = revenue * (baseNonLabourPct / 100) + nonLabourChange;
    const nonLabourPct = revenue ? (nonLabour / revenue) * 100 : 0;
    const netProfit = revenue - payroll - nonLabour;
    const productivity = employees > 0 ? revenue / employees : 0;

    return {
      revenue,
      employees,
      targetEmployees,
      payroll,
      nonLabour,
      nonLabourPct,
      nonLabourChange,
      nonLabourBreakdown,
      // Effective change in non-labour share of revenue vs baseline (fixed £ drivers included)
      nonLabourChangePp: revenue ? nonLabourPct - baseNonLabourPct : 0,
      netProfit,
      netMarginPct: revenue ? (netProfit / revenue) * 100 : 0,
      productivity,
      productivityPct: baseProductivity ? (productivity / baseProductivity - 1) * 100 : 0,
      targetProductivity,
      targetProductivityPct: productivityPath[i]
    };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { spreadLinear, driverAmounts, computeScenarioPnl };
}
