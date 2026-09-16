/**
 * Audit Report Controller
 * Handles HTTP requests for Audit Reports, KPI metrics, chart analytics, and CSV exports.
 */
import * as auditReportService from './auditReport.service.js';

/**
 * GET /api/stocktakes/reports/summary
 * Retrieves audit header, 8 KPI counts/percentages, donut chart breakdown, and location/trend charts.
 */
export async function getReportSummary(req, res) {
  try {
    const { auditId, company, location, dateRange, status } = req.query;
    const summary = await auditReportService.getReportSummary({
      auditId,
      company,
      location,
      dateRange,
      status
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Failed to get audit report summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit report summary',
      error: error.message
    });
  }
}

/**
 * GET /api/stocktakes/reports/assets
 * Retrieves paginated detailed asset results with tabs (Detailed Results, Exceptions, Not Found, Moved, Damaged, Unregistered).
 */
export async function getReportAssets(req, res) {
  try {
    const { auditId, tab, filter, search, page = 1, limit = 50 } = req.query;
    const result = await auditReportService.getReportAssets({
      auditId,
      tab,
      filter,
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Failed to get audit report assets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit report assets',
      error: error.message
    });
  }
}

/**
 * GET /api/stocktakes/reports/export
 * Exports audit report as CSV file or JSON.
 */
export async function exportReport(req, res) {
  try {
    const { auditId = 'AUD-2026-0008', format = 'csv' } = req.query;
    const result = await auditReportService.exportReport({ auditId, format });

    if (format === 'csv') {
      res.setHeader('Content-Type', result.contentType || 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      return res.send(result.content);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Failed to export audit report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit report',
      error: error.message
    });
  }
}
