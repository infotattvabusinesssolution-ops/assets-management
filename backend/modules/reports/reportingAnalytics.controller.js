/**
 * Reporting & Analytics Controller
 * Handles HTTP requests for the centralized management intelligence dashboard,
 * interactive drill-downs, scheduled report controls, and AI-assisted analytics.
 */
import * as reportingService from './reportingAnalytics.service.js';

/**
 * GET /api/v1/reports/analytics/dashboard
 * Retrieves the 5 management KPIs, 3 analytical charts, recent reports and scheduled reports.
 */
export async function getDashboardAnalytics(req, res) {
  try {
    const { category, reportType, dateRange, location, department, company } = req.query;
    const data = await reportingService.getDashboardAnalytics({
      category,
      reportType,
      dateRange,
      location,
      department,
      company
    });

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Failed to get dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard analytics',
      error: error.message
    });
  }
}

/**
 * GET /api/v1/reports/analytics/drill-down
 * Retrieves paginated underlying records for a clicked KPI or chart segment.
 */
export async function getDrillDownRecords(req, res) {
  try {
    const { metricKey, filterType, filterValue, page = 1, limit = 20 } = req.query;
    const data = await reportingService.getDrillDownRecords({
      metricKey,
      filterType,
      filterValue,
      page,
      limit
    });

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Failed to get drill-down records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drill-down records',
      error: error.message
    });
  }
}

/**
 * PATCH /api/v1/reports/analytics/scheduled/:id/toggle
 * Toggles a scheduled report status between Active and Paused.
 */
export async function toggleScheduledReport(req, res) {
  try {
    const { id } = req.params;
    const updated = await reportingService.toggleScheduledReport(id);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Failed to toggle scheduled report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle scheduled report status',
      error: error.message
    });
  }
}

/**
 * POST /api/v1/reports/analytics/scheduled
 * Creates a new scheduled report configuration.
 */
export async function createScheduledReport(req, res) {
  try {
    const newReport = await reportingService.createScheduledReport(req.body);

    res.status(201).json({
      success: true,
      data: newReport
    });
  } catch (error) {
    console.error('Failed to create scheduled report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scheduled report',
      error: error.message
    });
  }
}

/**
 * POST /api/v1/reports/analytics/ai-query
 * Analyzes natural-language reporting prompts and returns verified records.
 */
export async function queryAiAnalytics(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt query is required'
      });
    }

    const analysis = await reportingService.queryAiAnalytics({
      prompt,
      userRole: req.user?.role?.code || 'SYS_ADMIN',
      locationScope: req.user?.siteId || 'Dubai HQ'
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Failed to process AI analytics query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI analytics query',
      error: error.message
    });
  }
}
