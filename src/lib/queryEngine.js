/**
 * Represents a data table that supports fluent, chainable data wrangling operations
 * similar to Arquero.
 */
class QueryTable {
  /**
   * Creates an instance of QueryTable.
   * @param {Array<Object>} data - The source dataset.
   */
  constructor(data) {
    /** @type {Array<Object>} */
    this._data = Array.isArray(data) ? data : [];
    /** @type {Array<string>|null} */
    this._groups = null;
  }

  /**
   * Filters table rows based on a predicate function.
   * @param {function(Object, number): boolean} predicate - A function evaluated for each row.
   * @returns {QueryTable} A new QueryTable containing only rows that satisfy the predicate.
   * @example
   * aq(data).filter(row => row.amount > 100)
   */
  filter(predicate) {
    return new QueryTable(this._data.filter(predicate));
  }

  /**
   * Defines the grouping keys for subsequent aggregation rollups.
   * @param {...string} keys - Names of the columns to group by.
   * @returns {QueryTable} A new QueryTable marked with grouping keys.
   * @example
   * aq(data).groupby('payment_method', 'status')
   */
  groupby(...keys) {
    const table = new QueryTable(this._data);
    table._groups = keys.flat();
    return table;
  }

  /**
   * Collapses grouped rows into summary aggregates.
   * If groupby was not called, aggregates the entire dataset into a single row.
   * @param {Object<string, function(Array<Object>): *>} aggregations - Col-name to aggregator mapping.
   * @returns {QueryTable} A new QueryTable containing the rolled up summaries.
   * @example
   * aq(data).groupby('payment_method').rollup({
   *   total: op.sum('amount'),
   *   count: op.count()
   * })
   */
  rollup(aggregations) {
    if (!this._groups || this._groups.length === 0) {
      const result = {};
      for (const [newCol, aggFn] of Object.entries(aggregations)) {
        result[newCol] = aggFn(this._data);
      }
      return new QueryTable([result]);
    }

    const groupMap = new Map();
    for (const row of this._data) {
      const groupKey = this._groups.map(k => String(row[k] ?? '')).join('|');
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          groupValues: this._groups.reduce((acc, k) => {
            acc[k] = row[k];
            return acc;
          }, {}),
          rows: []
        });
      }
      groupMap.get(groupKey).rows.push(row);
    }

    const aggregatedData = [];
    for (const group of groupMap.values()) {
      const rolled = { ...group.groupValues };
      for (const [newCol, aggFn] of Object.entries(aggregations)) {
        rolled[newCol] = aggFn(group.rows);
      }
      aggregatedData.push(rolled);
    }

    return new QueryTable(aggregatedData);
  }

  /**
   * Derives new calculated columns or overrides existing ones.
   * @param {Object<string, function(Object): *>} derivations - Col-name to formula functions.
   * @returns {QueryTable} A new QueryTable with calculated columns appended.
   * @example
   * aq(data).derive({
   *   tax: row => row.amount * 0.18,
   *   grandTotal: row => row.amount + row.tax
   * })
   */
  derive(derivations) {
    const derived = this._data.map(row => {
      const newRow = { ...row };
      for (const [col, deriveFn] of Object.entries(derivations)) {
        newRow[col] = deriveFn(newRow);
      }
      return newRow;
    });
    return new QueryTable(derived);
  }

  /**
   * Sorts rows based on one or more column keys.
   * Prefix column names with a minus sign '-' to sort in descending order.
   * @param {...string} keys - Keys to sort by.
   * @returns {QueryTable} A new sorted QueryTable.
   * @example
   * aq(data).orderby('-amount', 'date')
   */
  orderby(...keys) {
    const sorted = [...this._data].sort((a, b) => {
      for (const key of keys) {
        let isDesc = false;
        let actualKey = key;
        if (key.startsWith('-')) {
          isDesc = true;
          actualKey = key.slice(1);
        }
        const valA = a[actualKey];
        const valB = b[actualKey];
        if (valA === valB) continue;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
      }
      return 0;
    });
    return new QueryTable(sorted);
  }

  /**
   * Restricts columns returned in the output objects.
   * @param {...string} keys - Attribute names to keep.
   * @returns {QueryTable} A new QueryTable containing only selected columns.
   * @example
   * aq(data).select('id', 'amount')
   */
  select(...keys) {
    const selectedKeys = keys.flat();
    const selected = this._data.map(row => {
      const newRow = {};
      for (const key of selectedKeys) {
        newRow[key] = row[key];
      }
      return newRow;
    });
    return new QueryTable(selected);
  }

  /**
   * Unwraps the QueryTable and returns the underlying array of plain Javascript objects.
   * @returns {Array<Object>} The plain dataset array.
   */
  objects() {
    return this._data;
  }
}

/**
 * Creates a fluent QueryTable wrapper over a raw array.
 * @param {Array<Object>} data - The source array.
 * @returns {QueryTable} The fluent QueryTable wrapper.
 */
export const aq = (data) => new QueryTable(data);

/**
 * Collection of standard aggregate rollup operators.
 */
export const op = {
  /**
   * Sums numeric values of a column.
   * @param {string} col - Column name.
   * @returns {function(Array<Object>): number} Reusable aggregator function.
   */
  sum: (col) => (rows) => rows.reduce((sum, r) => sum + (Number(r[col]) || 0), 0),

  /**
   * Counts rows in group.
   * @returns {function(Array<Object>): number} Reusable aggregator function.
   */
  count: () => (rows) => rows.length,

  /**
   * Calculates average mean of a numeric column.
   * @param {string} col - Column name.
   * @returns {function(Array<Object>): number} Reusable aggregator function.
   */
  mean: (col) => (rows) => rows.length === 0 ? 0 : rows.reduce((sum, r) => sum + (Number(r[col]) || 0), 0) / rows.length,

  /**
   * Finds maximum value in a numeric column.
   * @param {string} col - Column name.
   * @returns {function(Array<Object>): number} Reusable aggregator function.
   */
  max: (col) => (rows) => rows.length === 0 ? undefined : Math.max(...rows.map(r => Number(r[col]) || 0)),

  /**
   * Finds minimum value in a numeric column.
   * @param {string} col - Column name.
   * @returns {function(Array<Object>): number} Reusable aggregator function.
   */
  min: (col) => (rows) => rows.length === 0 ? undefined : Math.min(...rows.map(r => Number(r[col]) || 0)),
};
