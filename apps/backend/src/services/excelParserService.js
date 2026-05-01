import xlsx from 'xlsx';

const COLUMN_ALIASES = {
  date: ['date', 'transaction date', 'posted date'],
  description: ['description', 'details', 'memo', 'note'],
  category: ['category', 'expense category', 'income category'],
  type: ['type', 'transaction type', 'kind'],
  amount: ['amount', 'value', 'total'],
  source: ['source', 'account', 'wallet']
};

export class ExcelParserService {
  /**
   * Parses the first worksheet in an XLSX buffer into normalized transactions.
   * @param {Buffer} workbookBuffer
   * @returns {Array<object>}
   */
  parseTransactionsFromWorkbook(workbookBuffer) {
    const workbook = xlsx.read(workbookBuffer, { type: 'buffer', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error('The uploaded workbook does not contain any worksheets.');
    }

    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
      defval: '',
      raw: false
    });

    return rows
      .map((row) => this.normalizeTransactionRow(row))
      .filter((transaction) => transaction !== null);
  }

  /**
   * Converts a worksheet row into the canonical transaction shape.
   * @param {object} row
   * @returns {object | null}
   */
  normalizeTransactionRow(row) {
    const normalizedKeys = this.createNormalizedKeyMap(row);
    const amount = this.parseAmount(this.readAliasedValue(row, normalizedKeys, 'amount'));

    if (!amount) {
      return null;
    }

    const rawType = String(this.readAliasedValue(row, normalizedKeys, 'type') || '').toLowerCase();
    const type = this.resolveTransactionType(rawType, amount);

    return {
      date: this.parseDate(this.readAliasedValue(row, normalizedKeys, 'date')),
      description: String(this.readAliasedValue(row, normalizedKeys, 'description') || 'Imported transaction').trim(),
      category: String(this.readAliasedValue(row, normalizedKeys, 'category') || 'Uncategorized').trim(),
      type,
      amount: Math.abs(amount),
      source: String(this.readAliasedValue(row, normalizedKeys, 'source') || 'XLSX import').trim()
    };
  }

  /**
   * Builds a lookup that lets the parser accept friendly column variations.
   * @param {object} row
   * @returns {Map<string, string>}
   */
  createNormalizedKeyMap(row) {
    return new Map(
      Object.keys(row).map((key) => [String(key).trim().toLowerCase(), key])
    );
  }

  /**
   * Reads a value from a row using the configured aliases for a canonical field.
   * @param {object} row
   * @param {Map<string, string>} normalizedKeys
   * @param {string} fieldName
   * @returns {unknown}
   */
  readAliasedValue(row, normalizedKeys, fieldName) {
    const aliases = COLUMN_ALIASES[fieldName] || [fieldName];
    const matchedAlias = aliases.find((alias) => normalizedKeys.has(alias));

    return matchedAlias ? row[normalizedKeys.get(matchedAlias)] : '';
  }

  /**
   * Parses spreadsheet dates, ISO strings, and common locale date strings.
   * @param {unknown} value
   * @returns {string}
   */
  parseDate(value) {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    const parsedDate = new Date(String(value || ''));
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().slice(0, 10);
    }

    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Converts currency-like cell values into finite numeric amounts.
   * @param {unknown} value
   * @returns {number}
   */
  parseAmount(value) {
    const sanitizedValue = String(value || '').replace(/[^0-9.-]/g, '');
    const amount = Number(sanitizedValue);

    return Number.isFinite(amount) ? amount : 0;
  }

  /**
   * Resolves income or expense from an explicit type column or amount sign.
   * @param {string} rawType
   * @param {number} amount
   * @returns {'income' | 'expense'}
   */
  resolveTransactionType(rawType, amount) {
    if (rawType.includes('income') || rawType.includes('credit')) {
      return 'income';
    }

    if (rawType.includes('expense') || rawType.includes('debit')) {
      return 'expense';
    }

    return amount >= 0 ? 'income' : 'expense';
  }
}
