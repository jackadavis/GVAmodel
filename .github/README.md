# GVA Scenario Modeler v3.0

The **GVA Scenario Modeler** is an interactive web-based playground designed to model, compare, and forecast employment, financial performance, and Gross Value Added (GVA) scenarios. It provides us, advisors with the tools to simulate baseline growth (Without Grant) and project-supported expansion (With Grant).

---

## Getting Started

To run the modeler locally:
1. Open [index.html] in any web browser.
2. Enter the credentials to access secure dashboard.

---

## User Guide

### 1. Initializing the Model
Upon successful sign-in, the **Baseline Startup Wizard** modal will prompt you to enter initial values so make sure we have them from the client:
* **Baseline Turnover / Revenue (£k)**
* **Baseline Net Profit Before Tax (£k)**
* **Baseline Employee Count**
* **Total Salary Cost (£k)**

## Good to have 
* **company ambition over 3 years** - company’s expectation from the project over next three years can be aligned with MS roadmap
* **Depreciation over next 3 years** otherwise the DTS/company needs to update it

These default baseline values establish the starting point for both scenarios. You can update these values at any time by clicking the **Edit Baseline** button in the summary panel.
---

### 2. Scenario 1: Without Grant (Baseline Growth)
* **Draggable Revenue Chart**: Set your forecasted turnover by dragging points directly on the interactive SVG chart.
* **YoY Growth Presets**: Automatically apply fixed growth trends of 5%, 10%, or 20% year-over-year.
* **Employee Inputs**: Adjust headcount for Year 1, Year 2, and Year 3.
* **Net Profit Sliders**: Set the expected profit margin. Margins can be adjusted in a range from -100% to +80%.
* **Margin Presets**: Instantly set margin trends using `-1% Trend`, `Stable`, or `+1% Trend` presets.

---
### 3. Scenario 2: With Grant (Expansion Growth)
* **Draggable Revenue Chart**: Forecast turnover under the project-supported growth scenario.
* **Salary Band Hiring Forecasts**: Instead of inputting Year 1-3 headcount directly, Scenario 2 employs detailed hiring projections divided into 6 distinct salary bands:
  * Less than £15,800 (Valued at £15k)
  * £15,801 - £25,000 (Valued at £20.4k)
  * £25,001 - £35,000 (Valued at £30k)
  * £35,001 - £45,000 (Valued at £40k)
  * £45,001 - £55,000 (Valued at £50k)
  * £55,000+ (Valued at £65k)
* **Upskilling Forecast**: Track the number of FTEs upskilled and add custom training notes.

### 4. Summary Metrics & Comparison Panel
* **Live Calculation**: The sidebar computes annual employee costs, net profit values, and GVA differences for both scenarios. Collapsable UI.
* **Project Cost Intervention**: Enter the estimated intervention cost to view cumulative GVA and Return on Investment metrics.
* **Manual Comparison Table**: Enter static comparison metrics or click **Expand** to run interactive validation checks.
* **State Persistence**: The model saves your comparison inputs in `sessionStorage` so your work remains intact on page reload.
* **CSV Export & Import**: Export the entire scenario state (summary tables, employment forecasts, salary bands, and model parameters) to a CSV, or import a previously exported CSV file.

---

## Assumptions

The model makes the following underlying assumptions during calculations:
1. **Average Salary Metric**: The average annual salary per employee calculated in the baseline year is assumed to remain constant for existing baseline headcount.
2. **Salary Band Valuations**: New jobs created under Scenario 2 are valued at the midpoint/fixed rates specified for each salary band (ranging from £15k to £65k).
3. **Productivity Gains**: Productivity is defined as Revenue per Employee. YoY productivity changes reflect revenue changes relative to fluctuations in headcount.
4. **Base Year Shifting**: The application dynamically determines the current base financial year based on the current system date. A month >= April (3) shifts the base year to the current calendar year; otherwise, it is set to the previous year.
5. **Depreciation**: Project is assumed to depreciate over period of 3 years and therefore the project cost can be directly added to incremental GVA figure

---

## Formulas

All financial calculations and conversions use the following formulas implemented in `GVA_modeler.js`

### 1. Cost Per Employee (Average Salary)
$$\text{Cost Per Employee} = \frac{\text{Baseline Employee Cost}}{\text{Baseline Headcount}}$$

### 2. Annual Employee Cost
$$\text{Annual Employee Cost}_t = \text{Headcount}_t \times \text{Cost Per Employee}$$

### 3. Net Profit Value (with payroll adjustment)
For forecasted years ($t \ge 1$), Net Profit is adjusted downward if salary costs exceed the baseline year's salary cost:
$$\text{Payroll Adjustment}_t = \text{Annual Employee Cost}_t - \text{Baseline Employee Cost}$$
$$\text{Net Profit}_t = (\text{Revenue}_t \times \text{Net Profit Margin \%}_t) - \text{Payroll Adjustment}_t$$

### 4. Gross Value Added (GVA)
$$\text{GVA}_t = \text{Annual Employee Cost}_t + \text{Net Profit}_t$$

### 5. Incremental GVA (S2 − S1)
$$\Delta \text{GVA}_t = \text{GVA}_{S2, t} - \text{GVA}_{S1, t}$$

### 6. Cumulative / Total GVA
$$\text{Total GVA} = \sum_{t=1}^{3} \Delta \text{GVA}_t + \text{Project Cost}$$

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
* **Interactive Elements**: Custom inline SVG rendering with mouse/touch pointer events for dragging revenue points.
* **Caching**: Utilizes `sessionStorage` to store table states, sidebar toggle states, and baseline configuration flags.