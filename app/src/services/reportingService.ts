import { FinancialReport, TransparencyMetrics } from '../types/treasury';

/**
 * Generate a financial report for a specific period
 */
export async function generateFinancialReport(
  type: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
  period: string
): Promise<FinancialReport> {
  try {
    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, period }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw error;
  }
}

/**
 * Get all available financial reports
 */
export async function getFinancialReports(
  type?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
  limit: number = 20
): Promise<FinancialReport[]> {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (type) params.append('type', type);

    const response = await fetch(`/api/reports/list?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    return [];
  }
}

/**
 * Get a specific financial report by ID
 */
export async function getFinancialReport(reportId: string): Promise<FinancialReport | null> {
  try {
    const response = await fetch(`/api/reports/${reportId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching financial report:', error);
    return null;
  }
}

/**
 * Export financial report to PDF
 */
export async function exportReportToPDF(reportId: string): Promise<Blob> {
  try {
    const response = await fetch(`/api/reports/${reportId}/export/pdf`);
    if (!response.ok) {
      throw new Error('Failed to export report');
    }
    return await response.blob();
  } catch (error) {
    console.error('Error exporting report to PDF:', error);
    throw error;
  }
}

/**
 * Export financial report to CSV
 */
export async function exportReportToCSV(reportId: string): Promise<Blob> {
  try {
    const response = await fetch(`/api/reports/${reportId}/export/csv`);
    if (!response.ok) {
      throw new Error('Failed to export report');
    }
    return await response.blob();
  } catch (error) {
    console.error('Error exporting report to CSV:', error);
    throw error;
  }
}

/**
 * Schedule automatic report generation
 */
export async function scheduleReportGeneration(
  type: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
  recipients: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/reports/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipients }),
    });

    if (!response.ok) {
      throw new Error('Failed to schedule report');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error scheduling report:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get report generation schedule
 */
export async function getReportSchedule(): Promise<any[]> {
  try {
    const response = await fetch('/api/reports/schedule');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching report schedule:', error);
    return [];
  }
}

/**
 * Send report to stakeholders
 */
export async function sendReportToStakeholders(
  reportId: string,
  recipients: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/reports/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, recipients }),
    });

    if (!response.ok) {
      throw new Error('Failed to send report');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending report:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get report summary statistics
 */
export async function getReportStatistics(): Promise<{
  totalReports: number;
  monthlyReports: number;
  quarterlyReports: number;
  annualReports: number;
  lastGenerated: Date | null;
}> {
  try {
    const response = await fetch('/api/reports/statistics');
    const data = await response.json();
    return {
      ...data,
      lastGenerated: data.lastGenerated ? new Date(data.lastGenerated) : null,
    };
  } catch (error) {
    console.error('Error fetching report statistics:', error);
    return {
      totalReports: 0,
      monthlyReports: 0,
      quarterlyReports: 0,
      annualReports: 0,
      lastGenerated: null,
    };
  }
}

/**
 * Compare two financial reports
 */
export async function compareReports(
  reportId1: string,
  reportId2: string
): Promise<{
  report1: FinancialReport;
  report2: FinancialReport;
  comparison: {
    revenueChange: number;
    revenueChangePercent: number;
    expenseChange: number;
    expenseChangePercent: number;
    netIncomeChange: number;
    netIncomeChangePercent: number;
    userGrowth: number;
    userGrowthPercent: number;
    transactionGrowth: number;
    transactionGrowthPercent: number;
  };
}> {
  try {
    const response = await fetch(`/api/reports/compare?report1=${reportId1}&report2=${reportId2}`);
    if (!response.ok) {
      throw new Error('Failed to compare reports');
    }
    return await response.json();
  } catch (error) {
    console.error('Error comparing reports:', error);
    throw error;
  }
}

/**
 * Get transparency metrics for dashboard
 */
export async function getTransparencyMetrics(
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
): Promise<TransparencyMetrics> {
  try {
    const response = await fetch(`/api/transparency/metrics?period=${period}`);
    if (!response.ok) {
      throw new Error('Failed to fetch transparency metrics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transparency metrics:', error);
    throw error;
  }
}

/**
 * Get historical transparency data
 */
export async function getHistoricalTransparency(
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
  limit: number = 12
): Promise<TransparencyMetrics[]> {
  try {
    const response = await fetch(`/api/transparency/historical?period=${period}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching historical transparency data:', error);
    return [];
  }
}

/**
 * Trigger manual report generation (admin only)
 */
export async function triggerManualReportGeneration(
  type: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const response = await fetch('/api/reports/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger report generation');
    }

    const data = await response.json();
    return { success: true, reportId: data.reportId };
  } catch (error: any) {
    console.error('Error triggering report generation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Validate report data integrity
 */
export async function validateReportIntegrity(reportId: string): Promise<{
  valid: boolean;
  issues?: string[];
}> {
  try {
    const response = await fetch(`/api/reports/${reportId}/validate`);
    if (!response.ok) {
      throw new Error('Failed to validate report');
    }
    return await response.json();
  } catch (error) {
    console.error('Error validating report:', error);
    return { valid: false, issues: ['Validation failed'] };
  }
}

/**
 * Archive old reports
 */
export async function archiveOldReports(
  olderThanDays: number
): Promise<{ success: boolean; archivedCount?: number; error?: string }> {
  try {
    const response = await fetch('/api/reports/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ olderThanDays }),
    });

    if (!response.ok) {
      throw new Error('Failed to archive reports');
    }

    const data = await response.json();
    return { success: true, archivedCount: data.archivedCount };
  } catch (error: any) {
    console.error('Error archiving reports:', error);
    return { success: false, error: error.message };
  }
}

export default {
  generateFinancialReport,
  getFinancialReports,
  getFinancialReport,
  exportReportToPDF,
  exportReportToCSV,
  scheduleReportGeneration,
  getReportSchedule,
  sendReportToStakeholders,
  getReportStatistics,
  compareReports,
  getTransparencyMetrics,
  getHistoricalTransparency,
  triggerManualReportGeneration,
  validateReportIntegrity,
  archiveOldReports,
};
