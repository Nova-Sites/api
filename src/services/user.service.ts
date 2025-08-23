import bcrypt from 'bcrypt';
import { User } from '@/models';
import { IUser } from '@/types';
import { USER_ROLES, OTP_CONSTANTS } from '@/constants';
import { EmailService } from './email.service';
import { UserValidationUtils } from '@/utils/userValidation';
import { JWTUtils, TokenPair } from '@/utils/jwtUtils';
import { Op } from 'sequelize';

export class UserService {
  /**
   * Get all active users
   */
  static async getAllUsers(): Promise<IUser[]> {
    return await User.findAll({
      where: { isActive: true },
      attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<IUser | null> {
    return await User.findByPk(id, {
      attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] },
    });
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({
      where: { email },
    });
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({
      where: { username },
    });
  }

  /**
   * Check if email exists
   */
  static async isEmailExists(email: string): Promise<boolean> {
    const user = await User.findOne({
      where: { email },
      attributes: ['id'],
    });
    return !!user;
  }

  /**
   * Check if username exists
   */
  static async isUsernameExists(username: string): Promise<boolean> {
    const user = await User.findOne({
      where: { username },
      attributes: ['id'],
    });
    return !!user;
  }

  /**
   * Check if user exists (optimized version using utility)
   */
  static async checkUserExists(username: string, email: string): Promise<{ exists: boolean; existingUser?: any }> {
    return await UserValidationUtils.checkUserExists(username, email);
  }

  /**
   * Register new user
   */
  static async registerUser(userData: {
    username: string;
    email: string;
    password: string;
    image?: string;
  }): Promise<{ user: IUser; otp: string }> {
    // Check if user already exists using optimized utility
    const existenceCheck = await this.checkUserExists(userData.username, userData.email);
    if (existenceCheck.exists) {
      throw new Error('User with this username or email already exists');
    }

    // Hash password using utility
    const hashedPassword = await UserValidationUtils.hashPassword(userData.password);

    // Generate OTP
    const otp = EmailService.generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + OTP_CONSTANTS.EXPIRES_IN_MINUTES);

    // Create user
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      otp,
      otpExpiresAt,
      isActive: false,
      role: USER_ROLES.ROLE_USER,
    });

    // Send OTP email
    const emailSent = await EmailService.sendOTPEmail(
      userData.email,
      otp,
      userData.username
    );

    if (!emailSent) {
      // If email fails, delete the user and throw error
      await user.destroy();
      throw new Error('Failed to send OTP email');
    }

    return {
      user: user.toJSON() as IUser,
      otp,
    };
  }

  /**
   * Verify OTP and activate user
   */
  static async verifyOTP(email: string, otp: string): Promise<IUser> {
    const user = await User.findOne({
      where: {
        email,
        otp,
        otpExpiresAt: {
          [Op.gt]: new Date(), // OTP not expired
        },
      },
    });

    if (!user) {
      throw new Error('Invalid OTP or OTP expired');
    }

    // Activate user and clear OTP
    await user.update({
      isActive: true,
    });
    
    // Clear OTP fields separately
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return user.toJSON() as IUser;
  }

  /**
   * Resend OTP
   */
  static async resendOTP(email: string): Promise<{ user: IUser; otp: string }> {
    const user = await User.findOne({
      where: { email, isActive: false },
    });

    if (!user) {
      throw new Error('User not found or already activated');
    }

    // Generate new OTP
    const otp = EmailService.generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + OTP_CONSTANTS.EXPIRES_IN_MINUTES);

    // Update user with new OTP
    await user.update({
      otp,
      otpExpiresAt,
    });

    // Send new OTP email
    const emailSent = await EmailService.sendOTPEmail(
      email,
      otp,
      user.username
    );

    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }

    return {
      user: user.toJSON() as IUser,
      otp,
    };
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(id: number, updatedBy?: number): Promise<boolean> {
    const user = await User.findByPk(id);
    if (!user) {
      return false;
    }

    await user.update({ isActive: false, updatedBy: updatedBy ?? null });
    return true;
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: string): Promise<IUser[]> {
    return await User.findAll({
      where: { role, isActive: true },
      attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Search users
   */
  static async searchUsers(searchTerm: string): Promise<IUser[]> {
    return await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${searchTerm}%` } },
          { email: { [Op.iLike]: `%${searchTerm}%` } },
        ],
        isActive: true,
      },
      attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Authenticate user login
   */
  static async authenticateUser(email: string, password: string): Promise<{ user: IUser; tokens: TokenPair }> {
    // Find user by email with password included for verification
    const user = await User.findOne({
      where: { email },
      attributes: { exclude: ['otp', 'otpExpiresAt'] }, // Include password for verification
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is not activated. Please verify your email first.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = JWTUtils.generateTokenPair(user);

    // Return user data without password and tokens
    const userData = user.toJSON() as IUser;
    delete (userData as any).password; // Remove password from response

    return {
      user: userData,
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ user: IUser; tokens: TokenPair }> {
    try {
      // Verify refresh token
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);

      // Find user by ID
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is still active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Generate new token pair
      const tokens = JWTUtils.generateTokenPair(user);

      return {
        user: user.toJSON() as IUser,
        tokens,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user profile from token
   */
  static async getUserFromToken(token: string): Promise<IUser> {
    try {
      const decoded = JWTUtils.verifyAccessToken(token);
      
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      return user.toJSON() as IUser;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user profile by user ID
   */
  static async getUserProfile(userId: number): Promise<IUser | null> {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] },
    });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    return user.toJSON() as IUser;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: number,
    updateData: {
      username?: string;
      email?: string;
      image?: string;
    }
  ): Promise<IUser | null> {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    // Check if new email already exists (if email is being updated)
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.isEmailExists(updateData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Check if new username already exists (if username is being updated)
    if (updateData.username && updateData.username !== user.username) {
      const usernameExists = await this.isUsernameExists(updateData.username);
      if (usernameExists) {
        throw new Error('Username already exists');
      }
    }

    await user.update(updateData);
    return user.toJSON() as IUser;
  }

  /**
   * Update user avatar
   */
  static async updateUserAvatar(
    userId: number,
    imageUrl: string
  ): Promise<IUser | null> {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    await user.update({ image: imageUrl });
    return user.toJSON() as IUser;
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password using utility
    const hashedNewPassword = await UserValidationUtils.hashPassword(newPassword);

    // Update password
    await user.update({ password: hashedNewPassword });
    return true;
  }
} 