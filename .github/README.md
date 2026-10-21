# GVA Scenario Modeler v4.0

The **GVA Scenario Modeler** is an interactive web-based playground designed to model, compare, and forecast employment, financial performance, and Gross Value Added (GVA) scenarios. It provides us, advisors with the tools to simulate baseline growth (Without Grant) and project-supported expansion (With Grant).

---

## ASSUMPTIONS

These are fixed in the model and the exported workbook; they are not editable.

**Model**
1. **Average Salary**: Every employee, existing or new, is costed at the baseline average salary. Wages are never adjusted to fit the productivity line; headcount is rounded to whole people instead.
2. **Non-labour costs scale with revenue**: Non-labour costs (materials, energy, scrap, overheads) are the part of baseline revenue not taken by payroll or net profit, and stay the same share of revenue unless the non-labour cost saving changes it. With no change to any story except revenue, the net margin stays at the baseline margin.
3. **Productivity**: Productivity is revenue per employee. It is labour only: it changes headcount and payroll, not non-labour costs.
4. **Targets by year**: the productivity target and the non-labour cost saving are both entered for each year. Productivity is % vs baseline productivity.
5. **Base Year Shifting**: The application dynamically determines the current base financial year based on the current system date. A month >= April (3) shifts the base year to the current calendar year; otherwise, it is set to the previous year.
6. **Depreciation**: The client's baseline net profit is taken as already after depreciation, so baseline depreciation sits inside non-labour costs. One **baseline depreciation** figure is entered (in the baseline popup or the Depreciation section) and is used for the baseline and every forecast year, in both scenarios. In Scenario 2 the project cost is depreciated straight-line over 3 years (1/3 per year in Y1, Y2 and Y3) on top of it. Depreciation is added back in GVA (income approach).
7. **Project depreciation and net profit (to revisit)**: Project depreciation should reduce Scenario 2 net profit, which would cancel it out in GVA. It does not yet, so results match the previous model for validation.

**P&L sheet (exported workbook)**
8. **Gross profit is 50% of turnover in the baseline year.** It is not fixed in later years, so productivity gains raise the gross margin.
9. **Payroll splits 70% direct staff / 30% indirect staff.** Direct staff cost sits in cost of sales; indirect staff cost sits in administrative expenses.
10. **Materials & plant hire** = baseline cost of sales − baseline direct staff cost, and keep that **share of non-labour costs** in later years. Non-labour cost savings are therefore shared between materials and indirect costs in proportion to their baseline size.
11. **Indirect costs** (utilities, advertising, computers, professional services) are the balancing figure, so the P&L's net profit before tax always equals the GVA sheet's NPBT.
12. **No depreciation line**: depreciation is not shown as an expense (UK capital allowances apply for tax). Any depreciation already reflected in the client's NPBT sits within indirect costs.

---

## Getting Started

To run the modeler locally:
1. Open `GVA_Model_v4.0.html` in any web browser.
2. Enter the credentials to access secure dashboard.

---

## User Guide

### 1. Initializing the Model
Upon successful sign-in, the **Baseline Startup Wizard** modal will prompt you to enter initial values so make sure we have them from the client:
* **Baseline Turnover / Revenue (£k)**
* **Baseline Net Profit Before Tax (£)**
* **Baseline Employee Count**
* **Total Salary Cost (£)**
* **Baseline Depreciation (£)**: used for every year
* **Project Cost (£)**

## Good to have 
* **company ambition over 3 years** - company’s expectation from the project over next three years can be aligned with MS roadmap
* **Baseline depreciation** and the **project cost**: both can be entered in the baseline popup or later in the Depreciation section

These default baseline values establish the starting point for both scenarios. You can update these values at any time by clicking the **Edit Baseline** button in the summary panel.
---

### 2. The four stories
Each scenario is built from four stories. Headcount, payroll and net profit are calculated from them rather than entered.

| Story | What you set | Scenario 1 (no grant) | Scenario 2 (grant) |
| :--- | :--- | :--- | :--- |
| **1. Revenue growth** | Revenue each year: drag the chart, type values, or use the YoY presets | input | input |
| **2. Productivity target** | Revenue per employee, % vs baseline, for each of Years 1–3 | usually 0 / 0 / 0 | e.g. 0 / 4 / 10 (the default) |
| **3. Non-labour cost saving** | % points of turnover for each of Years 1–3 (+ = saving, − = cost increase) | e.g. 0, or − for material price rises | e.g. 0.5 / 1.2 / 2.0 from energy, scrap and purchasing savings |
| **4. Depreciation** | Baseline depreciation, used for every year; Scenario 2 adds the project cost over 3 years | baseline | baseline + project |

* The productivity target is entered for each year, each as % vs baseline productivity (not vs the year before).
* **Headcount** is the nearest whole number of people to that year's productivity target, costed at the baseline average salary. Each year shows the achieved productivity, e.g. *+25.7% productivity*; hover over it to see the target.
* **Manual headcount**: tick it (just above the employee boxes) to enter headcount for each year yourself (e.g. a known hiring plan). Changing a year moves the later years by the same amount. The productivity target boxes are then greyed out and show the productivity the entered headcount gives; unticking keeps those figures as the targets.
* **Net profit** is a result, shown with its margin for each year, alongside stacked badges for productivity and the non-labour cost saving vs baseline. The saving is in % points of turnover, so it adds straight onto the net profit % (e.g. a 2-point saving takes a 9.52% margin to 11.52%).
* **Non-labour cost saving** (each scenario): a box for each of Years 1–3, in **% points of turnover** (+ = saving, − = cost increase). It is the fall in non-labour costs (materials, plant hire and indirect costs) as a share of turnover vs the baseline year, so 2 means those costs fall from e.g. 63.2% to 61.2% of turnover; it is not a 2% cut in the costs themselves. The **£ value** of each year's saving is shown in grey under its box.

### 3. Scenario 2: to be implemented later
* **Job creation, upskilling and salary bands**: the whole panel is commented out until the model has been validated. Every employee is costed at the baseline average salary, and exports leave the upskilling rows blank.

### 4. Summary Metrics & Comparison Panel
* **Side panel switch**: The **Summary Metrics | Comparison Metrics** switch in the page header shows one panel at a time. Click the highlighted option again to hide the panel. **Revenue units (£k/£m)**, **Edit Baseline**, **Import**, **Export** and **Sign Out** are in the settings menu (the three-line button at the top right). **Company** and **Version** sit in the centre of the header.
* **Live Calculation**: The summary panel computes annual employee costs, net profit values, and GVA differences for both scenarios. It keeps updating while hidden.
* **Project Cost Intervention**: Enter the estimated intervention cost to view cumulative GVA and Return on Investment metrics.
* **Manual Comparison Table**: Enter static comparison metrics or click **Expand** to run interactive validation checks.
* **No Data Persistence**: No model or comparison data is stored in the browser. Reloading the page resets everything to defaults and shows the baseline setup again; use **Export** to keep your work and **Import** to restore it.
* **Excel Export & Import (.xlsx)**: Export writes the model into the grant-form workbook (`GVA Model Template.xlsx`), keeping its layout, colours and formulas. The file is named `GVA Model_<Company>_v<Version>.xlsx` from the **Company** and **Version** boxes in the page header. Import reads the same workbook back, including one filled in or edited by hand in Excel. CSV files are no longer supported.
  * **What's in the workbook**: revenue (£m), FTEs and **NPBT %** for each year, baseline labour and NPBT, depreciation, and project cost. The baseline depreciation is written to every year (D21:G21). On import, Year 1 (E21) is taken as the baseline depreciation; if a hand-edited workbook has different figures for other years, the import says so (this doesn't change GVA, as depreciation is the same in both scenarios).
  * **NPBT % is an input and NPBT £ = NPBT % × revenue (£m) × 1,000,000**, as in the original grant workbook (kept for backwards compatibility). The app's calculation differs, so on export it writes its calculated net margin into NPBT %, and the workbook's NPBT £ and GVA match the app exactly.
  * **Rows 39 and 47, "Non-labour cost saving (% points of turnover, calc.)"**, work out the saving implied by each year's NPBT %, the same measure as the app's. They are hidden; unhide them in Excel to see them.
  * **On import**, the app works out each year's non-labour cost saving from that year's NPBT %, so every year matches the workbook, including NPBT % typed in by hand.
  * **Older workbooks** in the original layout (no saving rows or hidden settings) can still be imported; productivity targets are set to 0% and the version left blank.
  * **Hidden rows 57–60** hold the productivity targets (Y1–Y3 in E:G of rows 58 and 59) and the model version for the app. Workbooks exported before per-year targets hold only the Year 3 target (G); on import, Y1 and Y2 are set to ⅓ and ⅔ of it, which gives the same results as before.
  * **P&L sheet**: a profit and loss for Without Grant, With Grant and the **Difference (with − without)**: turnover; cost of sales (materials & plant hire, direct staff cost); gross profit and margin; administrative expenses (indirect staff cost, indirect costs such as utilities, advertising, computers and professional services); net profit before tax and margin; FTEs. Each cost line has a **% of turnover** row beneath it (% points in the Difference block). Every "% of turnover" row (in all three blocks) is coloured by Excel conditional formatting: **green background when positive, red background with white text when negative** (Gross profit % and Net profit % rows are not coloured). Every figure is a formula off the GVA sheet, so it updates in Excel when the GVA inputs change. See **ASSUMPTIONS** 8–12.
  * **Headcount on import**: if the FTEs are what the productivity targets give, headcount stays calculated; if they were changed in Excel, **Manual headcount** is switched on with the workbook's FTEs.
  * **Not saved**: the comparison table (in-app only) and the base year (taken from today's date).
  * **Editing the template**: change `src/GVA Model Template.xlsx` in Excel, then run `node src/tools/embed-template.js` from the repo root to rebuild `src/GVA_template.js`, which the app uses so it works offline. Keep the input cells in the same places, or update `GVA_CELLS` in `src/GVA_workbook.js`.

---

## Formulas

The P&L engine lives in `src/GVA_engine.js` (`computeScenarioPnl`); depreciation and GVA are in `src/GVA_modeler.js`. Year 0 is the baseline, $t = 1..3$ are the forecast years.

### 1. Baseline (client figures)
$$\text{Cost Per Employee} = \frac{\text{Payroll}_0}{\text{Employees}_0} \qquad \text{Productivity}_0 = \frac{\text{Revenue}_0}{\text{Employees}_0}$$
$$\text{Non-labour}_0 = \text{Revenue}_0 - \text{Payroll}_0 - \text{Net Profit}_0 \qquad \text{NL\%}_0 = \frac{\text{Non-labour}_0}{\text{Revenue}_0}$$

### 2. Stories for each year
$$g_t = \text{Productivity Target}_t \quad \text{(\% vs baseline, entered for each year)}$$
The non-labour cost saving is also entered for each year (see section 4). Neither is spread.

### 3. Headcount and payroll
$$\text{Employees}_t = \text{round}\left(\frac{\text{Revenue}_t}{\text{Productivity}_0 \times (1 + g_t)}\right) \quad \text{(or the manual headcount)}$$
$$\text{Payroll}_t = \text{Employees}_t \times \text{Cost Per Employee}$$
$$\text{Achieved Productivity Change \%}_t = \left(\frac{\text{Revenue}_t / \text{Employees}_t}{\text{Productivity}_0} - 1\right) \times 100$$

### 4. Non-labour costs and net profit
$$\text{Non-labour}_t = \text{Revenue}_t \times \text{NL\%}_0 + \sum_{c} \text{Change}_{c,t}$$
$$\text{Net Profit}_t = \text{Revenue}_t - \text{Payroll}_t - \text{Non-labour}_t$$

With the non-labour cost saving $E_t$ entered for each year (% points of turnover), the change in each year is:
$$\text{Change}_t = -\text{Revenue}_t \times \frac{E_t}{100} \qquad \text{£ saving shown under each box} = -\text{Change}_t$$

The engine (`GVA_engine.js`) still accepts a list of drivers, including fixed £ amounts, so a per-category breakdown can be added back later without changing the core calculation.

The non-labour badge shows the effective change: $\frac{\text{Non-labour}_t}{\text{Revenue}_t} - \text{NL\%}_0$.

**Why this replaced the v3 calculation**: v3 worked out $\text{Net Profit}_t = \text{Revenue}_t \times \text{Margin}_t - (\text{Payroll}_t - \text{Payroll}_0)$. The margin is already after the full payroll, so when revenue grew with flat productivity the extra staff were charged twice. Example: revenue £2.1m → £2.21m, 19 → 20 staff at £42.1k gives net profit £210,526 (9.52%, unchanged); v3 gave £168,421, exactly one salary less. Where revenue is flat, v3 and v4 agree.

### 5. Depreciation
$$\text{Depreciation}_{S1, t} = \text{Baseline Depreciation} \quad (t = 0..3)$$
$$\text{Depreciation}_{S2, t} = \text{Baseline Depreciation} + \frac{\text{Project Cost}}{3} \quad (t = 1, 2, 3)$$

### 6. Gross Value Added (GVA)
$$\text{GVA}_t = \text{Payroll}_t + \text{Net Profit}_t + \text{Depreciation}_t$$

### 7. Incremental GVA (S2 − S1)
$$\Delta \text{GVA}_t = \text{GVA}_{S2, t} - \text{GVA}_{S1, t}$$

### 8. Cumulative / Total GVA
$$\text{Total GVA} = \sum_{t=1}^{3} \Delta \text{GVA}_t$$
The project cost is included through Scenario 2 depreciation, so it is not added separately.

---

## Sanity Checks

To ensure the financial and operational model remains logical, the **Comparison Metrics & Sanity Checks** modal implements four validators:

| Check | Metric / Formula | Healthy Range | Warning / Error Condition |
| :--- | :--- | :--- | :--- |
| **1. Average Annual Salary** | $\frac{\text{Baseline Cost}}{\text{Baseline Headcount}}$ | £12,000 − £150,000 | **Caution**: Below £12k (suggests scale error) or above £150k.<br>**Error**: Negative value or exceeds baseline turnover. |
| **2. Baseline Alignment** | S1 vs S2 baseline metrics comparison | Exact match | **Caution**: Mismatch between S1 and S2 baseline employee costs or net profits. |
| **3. Net Profit Margin** | $\frac{\text{Net Profit}}{\text{Revenue}} \times 100$ | 0% − 50% | **Caution**: Negative margin or margin > 50%.<br>**Error**: Margin > 80% or profit exceeds $(\text{Turnover} - \text{Employee Cost})$. |
| **4. GVA & ROI Validation** | $\text{ROI Multiplier} = \frac{\text{Total GVA}}{\text{Project Cost}}$ | $\ge 1.0\text{x}$ | **Caution**: ROI multiplier is less than 1.0x (costs exceed gains).<br>**Error**: Total GVA is negative. |

---

## Technical Stack & Architecture

* **Frontend**: Vanilla HTML5 structure, Vanilla CSS3 styling, and Vanilla ES6 JavaScript logic.
* **Excel files**: [ExcelJS](https://github.com/exceljs/exceljs) 4.4.0 (MIT licence), bundled in `src/vendor/` so import and export work without internet access.
* **Interactive Elements**: Custom inline SVG rendering with mouse/touch pointer events for dragging revenue points.
* **Folder layout**: `GVA_Model_v4.0.html` is the page; everything it loads is in `src/`. The deploy workflow (`.github/workflows/deploy.yml`) publishes it to GitHub Pages as `index.html` along with `src/`, leaving out `src/tools/` and the template `.xlsx`.
* **Caching**: Utilizes `sessionStorage` to store table states, sidebar toggle states, and baseline configuration flags.