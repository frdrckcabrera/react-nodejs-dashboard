import type { DashboardOverview, ImportResult } from '../types/finance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Fetches all dashboard data from the backend API.
 * @returns {Promise<DashboardOverview>}
 */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const response = await fetch(`${API_BASE_URL}/dashboard`);

  if (!response.ok) {
    throw new Error('Unable to load dashboard data.');
  }

  return response.json();
}

/**
 * Uploads an XLSX workbook to the backend import endpoint.
 * @param file
 * @returns {Promise<ImportResult>}
 */
export async function uploadExpenseWorkbook(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/import`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Import failed.' }));
    throw new Error(payload.message);
  }

  return response.json();
}
