// Reads and writes the GVA grant-form workbook (layout of "GVA Model Template.xlsx").
// Only input cells are written or read; every other cell keeps the template's formulas and styles.
// Money in the model object is in £k (like the rest of the app); the workbook holds £ and £m.
//
// For backwards compatibility the workbook takes NPBT % as an input and works out NPBT £ as
// % x revenue (£m) x 1e6. The app writes its calculated net margin there, so the workbook shows the
// app's figures; on import the app's non-labour cost saving for each year is worked out from that year's NPBT %.

const GVA_SHEET = 'GVA';

// Input cells in the current template. Index 0 is the baseline; Scenario 2's baseline is linked to Scenario 1.
const GVA_CELLS = {
  company: 'D2',
  depreciation: ['E21', 'F21', 'G21'],
  projectCost: 'B31',
  basePayroll: 'D36',
  baseNetProfit: 'D38',
  s1: {
    revenue: ['D34', 'E34', 'F34', 'G34'],
    employees: ['D35', 'E35', 'F35', 'G35'],
    npbtPct: [null, 'E37', 'F37', 'G37'],
    // Hidden app-settings row: productivity target for Y1-Y3 (% vs baseline). Files exported before
    // per-year targets hold only the Year 3 figure in G, with E and F blank.
    productivityTarget: [null, 'E58', 'F58', 'G58']
  },
  s2: {
    revenue: [null, 'E42', 'F42', 'G42'],
    employees: [null, 'E43', 'F43', 'G43'],
    npbtPct: [null, 'E45', 'F45', 'G45'],
    productivityTarget: [null, 'E59', 'F59', 'G59']
  },
  version: 'G60'
};

// The original workbook had no efficiency rows (row 39 and 47) and no hidden app settings
const GVA_LEGACY_CELLS = {
  ...GVA_CELLS,
  s2: {
    revenue: [null, 'E41', 'F41', 'G41'],
    employees: [null, 'E42', 'F42', 'G42'],
    npbtPct: [null, 'E44', 'F44', 'G44'],
    productivityTarget: null
  },
  s1: { ...GVA_CELLS.s1, productivityTarget: null },
  version: null
};

// Labels that identify each layout, so a different spreadsheet is rejected with a clear message
const GVA_LAYOUTS = [
  { cells: GVA_CELLS, checks: [['B34', /rev/i], ['B37', /npbt/i], ['B39', /saving|efficiency/i], ['B42', /rev/i], ['B45', /npbt/i]] },
  { cells: GVA_LEGACY_CELLS, checks: [['B34', /rev/i], ['B37', /npbt/i], ['B39', /productivity/i], ['B41', /rev/i], ['B44', /npbt/i]] }
];

const COMPANY_PLACEHOLDER = /^\s*<.*>\s*$/;

function base64ToBytes(base64) {
  if (typeof Buffer !== 'undefined' && typeof atob === 'undefined') return Buffer.from(base64, 'base64');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// A cell may hold a number, text, rich text or a formula with a cached result
function cellRaw(ws, address) {
  const v = ws.getCell(address).value;
  if (v && typeof v === 'object') {
    if ('result' in v) return v.result;
    if (Array.isArray(v.richText)) return v.richText.map(t => t.text).join('');
    if ('text' in v) return v.text;
  }
  return v;
}

function cellNumber(ws, address) {
  const v = cellRaw(ws, address);
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[£,%\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function cellText(ws, address) {
  const v = cellRaw(ws, address);
  return v === null || v === undefined ? '' : String(v).trim();
}

// model: { company, version, revenuesK: {s1, s2}, employees: {s1, s2}, basePayrollK, baseNetProfitK,
//          netMarginPct: {s1, s2} (app's calculated margin per year),
//          productivityTargetPct: {s1, s2} ([baseline, Y1, Y2, Y3], % vs baseline),
//          depreciation: [y1, y2, y3] (£), projectCost (£) }
async function writeGvaWorkbook(ExcelJSLib, templateBase64, model) {
  const wb = new ExcelJSLib.Workbook();
  await wb.xlsx.load(base64ToBytes(templateBase64));
  const ws = wb.getWorksheet(GVA_SHEET);

  // ExcelJS writes <pageSetUpPr> before <outlinePr> inside <sheetPr>, which Excel rejects as an XML error
  // ("Replaced Part: /xl/worksheets/sheet1.xml"). The template's outline settings are Excel's defaults
  // (summary below / right), so drop them and keep the fit-to-page setting. The P&L sheet is all
  // formulas off the GVA sheet, so it needs nothing else from here.
  wb.worksheets.forEach(sheet => { if (sheet.properties) delete sheet.properties.outlineProperties; });

  const cells = GVA_CELLS;
  ws.getCell(cells.company).value = model.company || '< INSERT CLIENT COMPANY NAME >';
  ws.getCell(cells.version).value = String(model.version || '');
  ws.getCell(cells.basePayroll).value = model.basePayrollK * 1000;
  ws.getCell(cells.baseNetProfit).value = model.baseNetProfitK * 1000;
  cells.depreciation.forEach((address, i) => { ws.getCell(address).value = model.depreciation[i] || 0; });
  ws.getCell(cells.projectCost).value = model.projectCost || 0;

  ['s1', 's2'].forEach(key => {
    const c = cells[key];
    c.revenue.forEach((address, i) => { if (address) ws.getCell(address).value = model.revenuesK[key][i] / 1000; });
    c.employees.forEach((address, i) => { if (address) ws.getCell(address).value = model.employees[key][i]; });
    // Full precision, so NPBT £ in the workbook equals the app's net profit
    c.npbtPct.forEach((address, i) => { if (address) ws.getCell(address).value = model.netMarginPct[key][i] / 100; });
    c.productivityTarget.forEach((address, i) => {
      if (address) ws.getCell(address).value = ((model.productivityTargetPct[key] || [])[i] || 0) / 100;
    });
  });

  // Excel recalculates every formula when the file opens, so outputs always match the inputs
  wb.calcProperties = { ...(wb.calcProperties || {}), fullCalcOnLoad: true };
  return wb;
}

// Non-labour cost saving (fraction of turnover) implied by a year's NPBT %, as in the workbook's
// saving rows: baseline non-labour share minus this year's non-labour share
function impliedEfficiency({ revenueK, employees, npbtPct, baseRevenueK, baseEmployees, basePayrollK, baseNetProfitK }) {
  if (!revenueK || !baseRevenueK) return 0;
  const averageCostK = baseEmployees ? basePayrollK / baseEmployees : 0;
  const baseNonLabour = (baseRevenueK - basePayrollK - baseNetProfitK) / baseRevenueK;
  const nonLabour = 1 - (employees * averageCostK) / revenueK - npbtPct;
  return baseNonLabour - nonLabour;
}

// Productivity targets [baseline, Y1, Y2, Y3] in % vs baseline. A file from before per-year targets has
// only the Year 3 figure (G) with E and F blank; it was spread in a straight line, so Y1 and Y2 are
// filled as 1/3 and 2/3 of it and the file gives the same results as before.
function readProductivityTargets(ws, addresses) {
  if (!addresses) return [0, 0, 0, 0];
  const blank = a => { const v = cellRaw(ws, a); return v === null || v === undefined || v === ''; };
  const y3 = cellNumber(ws, addresses[3]) * 100;
  if (blank(addresses[1]) && blank(addresses[2])) return [0, y3 / 3, (y3 * 2) / 3, y3];
  return [0, ...addresses.slice(1).map(a => cellNumber(ws, a) * 100)];
}

// Returns the model object, or throws an Error with a user-facing message.
// efficiencyPct[key] is the non-labour cost saving for each year ([baseline, Y1, Y2, Y3], % points of
// turnover) implied by that year's NPBT %, so every year imports exactly.
function readGvaWorkbook(wb) {
  const ws = wb.getWorksheet(GVA_SHEET);
  if (!ws) throw new Error(`This file has no "${GVA_SHEET}" sheet. Import a workbook exported from this app or based on the GVA Model template.`);
  const layout = GVA_LAYOUTS.find(l => l.checks.every(([address, pattern]) => pattern.test(cellText(ws, address))));
  if (!layout) {
    throw new Error("This workbook doesn't match the GVA Model template layout. Import a workbook exported from this app or based on the GVA Model template.");
  }
  const cells = layout.cells;

  const read = key => {
    const c = cells[key];
    return {
      revenuesK: c.revenue.map(a => (a ? cellNumber(ws, a) * 1000 : null)),
      employees: c.employees.map(a => (a ? cellNumber(ws, a) : null)),
      npbtPct: c.npbtPct.map(a => (a ? cellNumber(ws, a) : null)),
      productivityTargetPct: readProductivityTargets(ws, c.productivityTarget)
    };
  };
  const s1 = read('s1');
  const s2 = read('s2');
  // Scenario 2's baseline is linked to Scenario 1 in the template
  s2.revenuesK[0] = s1.revenuesK[0];
  s2.employees[0] = s1.employees[0];

  const base = {
    baseRevenueK: s1.revenuesK[0],
    baseEmployees: s1.employees[0],
    basePayrollK: cellNumber(ws, cells.basePayroll) / 1000,
    baseNetProfitK: cellNumber(ws, cells.baseNetProfit) / 1000
  };

  const efficiencyPct = {};
  [['s1', s1], ['s2', s2]].forEach(([key, s]) => {
    efficiencyPct[key] = [0, ...[1, 2, 3].map(i => 100 * impliedEfficiency({
      ...base, revenueK: s.revenuesK[i], employees: s.employees[i], npbtPct: s.npbtPct[i]
    }))];
  });

  const company = cellText(ws, cells.company);
  return {
    company: COMPANY_PLACEHOLDER.test(company) ? '' : company,
    version: cells.version ? cellText(ws, cells.version) : '',
    revenuesK: { s1: s1.revenuesK, s2: s2.revenuesK },
    employees: { s1: s1.employees, s2: s2.employees },
    basePayrollK: base.basePayrollK,
    baseNetProfitK: base.baseNetProfitK,
    npbtPct: { s1: s1.npbtPct, s2: s2.npbtPct },
    efficiencyPct,
    productivityTargetPct: { s1: s1.productivityTargetPct, s2: s2.productivityTargetPct },
    depreciation: cells.depreciation.map(a => cellNumber(ws, a)),
    projectCost: cellNumber(ws, cells.projectCost),
    legacyLayout: layout.cells === GVA_LEGACY_CELLS
  };
}

// "GVA Model_<Company>_v<Version>.xlsx", without characters Windows doesn't allow in file names
function gvaFileName(company, version) {
  const clean = s => String(s || '').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();
  const parts = ['GVA Model'];
  if (clean(company)) parts.push(clean(company));
  if (clean(version)) parts.push(`v${clean(version).replace(/^v/i, '')}`);
  return `${parts.join('_')}.xlsx`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GVA_CELLS, writeGvaWorkbook, readGvaWorkbook, gvaFileName };
}
