import prisma from '../../config/prisma.js';

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await prisma.auditEvent.findMany({
      include: {
        user: { select: { id: true, username: true, fullName: true, email: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 200
    });

    res.json({ success: true, logs });
  } catch (err) { next(err); }
}
