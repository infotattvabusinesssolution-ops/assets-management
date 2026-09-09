import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';
import { Role } from '../../models/Role.js';
import { config } from '../../config/index.js';

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const cleanUsername = username.trim();
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
    }).populate('roleId').populate('companyId').populate('siteId');

    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.roleId ? user.roleId.code : 'USER' },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.roleId,
        company: user.companyId,
        site: user.siteId
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate('roleId')
      .populate('companyId')
      .populate('siteId')
      .populate('departmentId')
      .populate('costCenterId');

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await User.find()
      .populate('roleId')
      .populate('companyId')
      .populate('siteId')
      .sort({ fullName: 1 });

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

export async function getRoles(req, res, next) {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.json({ success: true, roles });
  } catch (err) {
    next(err);
  }
}
