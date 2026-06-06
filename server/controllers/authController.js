import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../config/email.js';
import AuditLog from '../models/AuditLog.js';

const logAction = async (req, action, targetModel, targetId, details) => {
  try {
    await AuditLog.create({
      performedBy: req.user?._id,
      action,
      targetModel,
      targetId,
      details,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, organization } = req.body;
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }
  
  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    organization,
    role: 'participant',
  });
  
  if (user) {
    const token = generateToken(user);
    
    // Send welcome email
    try {
      await sendEmail({
        to: user.email,
        subject: `Welcome to ${process.env.PLATFORM_NAME || 'EventHub'}!`,
        html: `
          <h2>Welcome, ${user.fullName}!</h2>
          <p>Thank you for joining ${process.env.PLATFORM_NAME || 'EventHub'}.</p>
          <p>You can now browse and register for exciting events on our platform.</p>
          <p><a href="${process.env.CLIENT_URL}/login">Login to your account</a></p>
        `,
      });
    } catch (err) {
      console.error('Welcome email error:', err);
    }
    
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email }).select('+password');
  
  if (user && (await user.comparePassword(password))) {
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated. Contact support.');
    }
    
    const token = generateToken(user);
    
    await logAction(req, 'USER_LOGIN', 'User', user._id, `User ${user.email} logged in`);
    
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      organization: user.organization,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }
  
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();
  
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your EventHub password',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  } catch (err) {
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.status(500);
    throw new Error('Email could not be sent');
  }
  
  res.json({ message: 'Password reset email sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });
  
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }
  
  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  
  res.json({ message: 'Password reset successful' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ emailVerifyToken: token });
  
  if (!user) {
    res.status(400);
    throw new Error('Invalid verification token');
  }
  
  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  await user.save();
  
  res.json({ message: 'Email verified successfully' });
});

export const logout = asyncHandler(async (req, res) => {
  await logAction(req, 'USER_LOGOUT', 'User', req.user._id, `User ${req.user.email} logged out`);
  res.json({ message: 'Logged out successfully' });
});
