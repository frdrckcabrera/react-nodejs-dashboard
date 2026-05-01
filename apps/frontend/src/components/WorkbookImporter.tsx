import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadExpenseWorkbook } from '../api/expenseApi';

interface WorkbookImporterProps {
  onImported: () => Promise<void>;
}

/**
 * Provides an XLSX upload control and import status messaging.
 * @param props
 * @returns {JSX.Element}
 */
export function WorkbookImporter({ onImported }: WorkbookImporterProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('Upload an .xlsx workbook to refresh the dashboard.');
  const [isImporting, setIsImporting] = useState(false);

  /**
   * Opens the hidden file input when the visible upload button is pressed.
   * @returns {void}
   */
  function openFilePicker(): void {
    inputRef.current?.click();
  }

  /**
   * Uploads the selected XLSX file and refreshes dashboard data after import.
   * @param event
   * @returns {Promise<void>}
   */
  async function handleWorkbookSelection(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setIsImporting(true);
    setMessage(`Importing ${selectedFile.name}...`);

    try {
      const result = await uploadExpenseWorkbook(selectedFile);
      await onImported();
      setMessage(`Imported ${result.importedCount} transactions.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  }

  return (
    <section className="importer">
      <div>
        <h2>Workbook Import</h2>
        <p>{message}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="visually-hidden"
        onChange={handleWorkbookSelection}
      />
      <button type="button" onClick={openFilePicker} disabled={isImporting}>
        <Upload size={18} />
        {isImporting ? 'Importing' : 'Import XLSX'}
      </button>
    </section>
  );
}
