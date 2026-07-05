# Client-Side Calculations & Data Wrangling Standards

This document establishes coding rules and standard libraries for performing data aggregations, summaries, pivots, and date calculations on the client side.

---

## 1. Client-Side Aggregations & Query Engine

*   **Fluent Aggregations Wrapper**: 
    Avoid introducing heavy third-party dataframe wrangling packages (like Arquero or Pandas-js) for client-side aggregations on lightweight arrays.
*   **Standard**: 
    Import and use the project's fluent `queryEngine.js` wrapper (`aq(data).groupby().rollup()`) to perform group aggregation math, filters, and sorting operations cleanly.
    
    ```javascript
    import { aq, op } from 'src/lib/queryEngine';
    
    const summary = aq(transactions)
      .filter(tx => tx.amount > 0)
      .groupby('payment_method')
      .rollup({
        total: op.sum('amount'),
        count: op.count()
      })
      .orderby('-total')
      .objects();
    ```

---

## 2. Timezone & Locale Safe Date Operations

*   **Standardized Date Math**: 
    Never use native JavaScript comparison operators (`<`, `>`, `<=`, `>=`) or native `.toLocaleDateString()` formatting on dates, as they cause timezone and locale drift.
*   **Standard**: 
    Standardize on `date-fns` functions (`parseISO`, `compareDesc`, `format`, `isBefore`, `isAfter`, `isEqual`) for all date logic.
