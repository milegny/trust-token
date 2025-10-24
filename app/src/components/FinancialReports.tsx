import React, { useState, useEffect } from 'react';
import { FinancialReport } from '../types/treasury';
import {
  getFinancialReports,
  getFinancialReport,
  exportReportToPDF,
  exportReportToCSV,
  triggerManualReportGeneration,
  compareReports,
} from '../services/reportingService';

export const FinancialReports: React.FC = () => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [filterType, setFilterType] = useState<'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filterType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const type = filterType === 'ALL' ? undefined : filterType;
      const data = await getFinancialReports(type, 50);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL') => {
    try {
      setGenerating(true);
      const result = await triggerManualReportGeneration(type);
      
      if (result.success) {
        alert(`${type} report generated successfully!`);
        fetchReports();
      } else {
        alert(`Failed to generate report: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const report = await getFinancialReport(reportId);
      setSelectedReport(report);
    } catch (error) {
      console.error('Error viewing report:', error);
      alert('Failed to load report');
    }
  };

  const handleExportPDF = async (reportId: string) => {
    try {
      setExporting(true);
      const blob = await exportReportToPDF(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async (reportId: string) => {
    try {
      setExporting(true);
      const blob = await exportReportToCSV(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const formatSOL = (amount: number) => `${amount.toFixed(2)} SOL`;
  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  const getTypeColor = (type: string) => {
    const colors = {
      MONTHLY: 'bg-blue-100 text-blue-800',
      QUARTERLY: 'bg-purple-100 text-purple-800',
      ANNUAL: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Automated financial reporting and analytics</p>
        </div>
        
        {/* Generate Report Dropdown */}
        <div className="relative">
          <button
            onClick={() => {}}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Report ▼'}
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block">
            <button
              onClick={() => handleGenerateReport('MONTHLY')}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg"
            >
              Monthly Report
            </button>
            <button
              onClick={() => handleGenerateReport('QUARTERLY')}
              className="w-full text-left px-4 py-2 hover:bg-gray-50"
            >
              Quarterly Report
            </button>
            <button
              onClick={() => handleGenerateReport('ANNUAL')}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg"
            >
              Annual Report
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-2">
        {(['ALL', 'MONTHLY', 'QUARTERLY', 'ANNUAL'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Period</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Expenses</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Net Income</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Generated</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{report.period}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-green-600">
                      {formatSOL(report.summary.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-red-600">
                      {formatSOL(report.summary.totalExpenses)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-gray-900">
                      {formatSOL(report.summary.netIncome)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewReport(report.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleExportPDF(report.id)}
                          disabled={exporting}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium disabled:opacity-50"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleExportCSV(report.id)}
                          disabled={exporting}
                          className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                        >
                          CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No reports available</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedReport.type} Report - {selectedReport.period}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Generated: {new Date(selectedReport.generatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatSOL(selectedReport.summary.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatSOL(selectedReport.summary.totalExpenses)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Net Income</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatSOL(selectedReport.summary.netIncome)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Treasury Growth</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatSOL(selectedReport.summary.treasuryGrowth)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatNumber(selectedReport.keyMetrics.activeUsers)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Transaction Volume</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatNumber(selectedReport.keyMetrics.transactionVolume)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Avg Transaction</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatSOL(selectedReport.keyMetrics.averageTransactionValue)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Commission Rate</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatPercentage(selectedReport.keyMetrics.commissionRate)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Claim Rate</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatPercentage(selectedReport.keyMetrics.insuranceClaimRate)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Moderator Efficiency</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatPercentage(selectedReport.keyMetrics.moderatorEfficiency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {selectedReport.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                        <span className="text-blue-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
