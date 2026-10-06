import prisma from '../../config/prisma.js';

/**
 * GET /api/v1/audit/logs or /api/v1/audit
 * Retrieves filtered audit logs from the database
 */
export async function getAuditLogs(req, res) {
  try {
    const {
      search,
      user,
      module: mod,
      action,
      status,
      recordId,
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);

    const where = {};

    if (mod && mod !== 'All' && mod !== 'All Modules') {
      where.entityType = { contains: mod };
    }

    if (action && action !== 'All' && action !== 'All Actions') {
      where.action = { contains: action };
    }

    if (recordId && recordId.trim()) {
      where.entityId = { contains: recordId.trim() };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { entityId: { contains: q } },
        { action: { contains: q } },
        { entityType: { contains: q } }
      ];
    }

    const [total, events] = await Promise.all([
      prisma.auditEvent.count({ where }),
      prisma.auditEvent.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      })
    ]);

    const logs = events.map(evt => {
      const formattedDate = new Date(evt.timestamp).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      return {
        id: evt.id.startsWith('LOG-') ? evt.id : `LOG-${evt.id.substring(0, 8).toUpperCase()}`,
        rawId: evt.id,
        dateTime: formattedDate,
        timestamp: evt.timestamp.toISOString(),
        user: evt.user?.fullName || evt.user?.username || 'System Administrator',
        userEmail: evt.user?.email || 'admin@asset360.com',
        userType: evt.user ? 'Internal' : 'System Service',
        module: evt.entityType,
        action: evt.action,
        recordId: evt.entityId || 'SYS-EVENT',
        recordType: evt.entityType,
        status: 'Success',
        ipAddress: evt.ipAddress || '192.168.1.50',
        device: evt.userAgent || 'Web Browser (Enterprise Client)',
        company: 'Asset360 Holdings',
        location: 'Dubai HQ',
        description: `${evt.action.replace(/_/g, ' ')} operation logged on ${evt.entityType} ${evt.entityId || ''}`.trim(),
        oldValue: evt.beforeState || null,
        newValue: evt.afterState || null,
        additionalInfo: {
          sessionId: `SESS-${evt.id.substring(0, 6)}`,
          userAgent: evt.userAgent
        },
        relatedLogs: []
      };
    });

    return res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      logs
    });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/audit/logs/:id
 */
export async function getAuditLogById(req, res) {
  try {
    const { id } = req.params;
    const cleanId = id.replace(/^LOG-/, '');

    const evt = await prisma.auditEvent.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { id: id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!evt) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    const log = {
      id: evt.id.startsWith('LOG-') ? evt.id : `LOG-${evt.id.substring(0, 8).toUpperCase()}`,
      dateTime: new Date(evt.timestamp).toLocaleString(),
      timestamp: evt.timestamp.toISOString(),
      user: evt.user?.fullName || evt.user?.username || 'System',
      userEmail: evt.user?.email || 'admin@asset360.com',
      userType: evt.user ? 'Internal' : 'System Service',
      module: evt.entityType,
      action: evt.action,
      recordId: evt.entityId || 'N/A',
      recordType: evt.entityType,
      status: 'Success',
      ipAddress: evt.ipAddress || '192.168.1.1',
      device: evt.userAgent || 'Enterprise Web App',
      company: 'Asset360 Holdings',
      location: 'Dubai HQ',
      description: `${evt.action} on ${evt.entityType} ${evt.entityId || ''}`.trim(),
      oldValue: evt.beforeState,
      newValue: evt.afterState,
      additionalInfo: {
        sessionId: `SESS-${evt.id.substring(0, 6)}`
      },
      relatedLogs: []
    };

    return res.json({ success: true, log });
  } catch (err) {
    console.error('getAuditLogById error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
