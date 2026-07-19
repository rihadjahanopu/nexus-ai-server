import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { uploadToCloudinary } from '../utils/cloudinary';
import fs from 'fs';
import { AuthRequest } from '../middlewares/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any,
  });
};

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user._id.toString());
  
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    }
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'No Google token provided' });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ success: false, message: 'Invalid Google token' });
      return;
    }

    const { email, name, picture, sub: googleId } = payload;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email not found in Google account' });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        googleId,
        password: Math.random().toString(36).slice(-8)
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Google Login Failed' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    // Check if email is taken by another user
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user?._id } });
      if (existing) {
        res.status(400).json({ success: false, message: 'Email already in use by another account' });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { ...(name && { name }), ...(email && { email }) },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image uploaded' });
      return;
    }

    const result = await uploadToCloudinary(req.file.path, 'nexus/avatars');
    if (!result) {
      res.status(500).json({ success: false, message: 'Failed to upload avatar' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.status(200).json({ success: true, data: { avatar: result.secure_url, user } });
  } catch (error: any) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
};
