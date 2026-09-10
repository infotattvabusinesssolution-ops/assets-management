import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { config } from '../../config/index.js';

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const cleanUsername = username.trim();
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: cleanUsername,
          mode: 'insensitive'
        }
      },
      include: {
        role: true,
        company: true,
        site: true,
        department: true,
        costCenter: true
      }
    });

    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role ? user.role.code : 'USER' },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        company: user.company,
        site: user.site
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: true,
        company: true,
        site: true,
        department: true,
        costCenter: true
      }
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        company: true,
        site: true,
        department: true,
        costCenter: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

export async function getRoles(req, res, next) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, roles });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { username, email, password, fullName, phone, roleId, companyId, siteId, departmentId, costCenterId, active } = req.body;

    if (!username || !email || !password || !fullName || !roleId) {
      return res.status(400).json({ success: false, message: 'Required fields missing: username, email, password, fullName, roleId' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanUsername, mode: 'insensitive' } },
          { email: cleanEmail }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or Email is already registered' });
    }

    // Resolve Role by ID or Code
    const role = await prisma.role.findFirst({
      where: {
        OR: [
          { id: roleId },
          { code: roleId }
        ]
      }
    });

    if (!role) {
      return res.status(400).json({ success: false, message: `Invalid role specified: ${roleId}` });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        roleId: role.id,
        companyId: companyId || null,
        siteId: siteId || null,
        departmentId: departmentId || null,
        costCenterId: costCenterId || null,
        active: active !== undefined ? active : true
      },
      include: {
        role: true,
        company: true,
        site: true,
        department: true,
        costCenter: true
      }
    });

    res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { fullName, email, phone, roleId, companyId, siteId, departmentId, costCenterId, active } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await prisma.user.findFirst({
        where: {
          email: email.trim().toLowerCase(),
          id: { not: id }
        }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address is already in use by another user' });
      }
    }

    let resolvedRoleId = undefined;
    if (roleId) {
      const role = await prisma.role.findFirst({
        where: {
          OR: [
            { id: roleId },
            { code: roleId }
          ]
        }
      });
      if (role) {
        resolvedRoleId = role.id;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName ? fullName.trim() : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        roleId: resolvedRoleId,
        companyId: companyId !== undefined ? (companyId || null) : undefined,
        siteId: siteId !== undefined ? (siteId || null) : undefined,
        departmentId: departmentId !== undefined ? (departmentId || null) : undefined,
        costCenterId: costCenterId !== undefined ? (costCenterId || null) : undefined,
        active: active !== undefined ? Boolean(active) : undefined
      },
      include: {
        role: true,
        company: true,
        site: true,
        department: true,
        costCenter: true
      }
    });

    res.json({ success: true, message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    next(err);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    res.json({ success: true, message: `Password for ${user.username} has been reset successfully` });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: { active: false }
    });

    res.json({ success: true, message: `User ${user.username} has been deactivated` });
  } catch (err) {
    next(err);
  }
}
