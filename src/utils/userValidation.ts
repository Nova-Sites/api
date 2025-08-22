import bcrypt from 'bcrypt';
import { User } from '@/models';
import { MESSAGES, USER_ROLES } from '@/constants';
import { Op } from 'sequelize';

export interface UserValidationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class UserValidationUtils {
  /**
   * Validate username format and length
   */
  static validateUsername(username: string): ValidationResult {
    const errors: string[] = [];

    if (!username || username.trim().length === 0) {
      errors.push(MESSAGES.ERROR.USER.REQUIRED_USERNAME);
    } else {
      if (username.length < 3 || username.length > 50) {
        errors.push(MESSAGES.ERROR.USER.USERNAME_LENGTH);
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push(MESSAGES.ERROR.USER.USERNAME_FORMAT);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push(MESSAGES.ERROR.USER.REQUIRED_EMAIL);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(MESSAGES.ERROR.USER.INVALID_EMAIL);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate password strength and confirmation
   */
  static validatePassword(password: string, confirmPassword: string): ValidationResult {
    const errors: string[] = [];

    if (!password || password.length === 0) {
      errors.push(MESSAGES.ERROR.USER.REQUIRED_PASSWORD);
    } else {
      if (password.length < 6) {
        errors.push(MESSAGES.ERROR.USER.PASSWORD_LENGTH);
      }
    }

    if (password !== confirmPassword) {
      errors.push(MESSAGES.ERROR.USER.PASSWORD_MATCH);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate role if provided
   */
  static validateRole(role?: string): ValidationResult {
    const errors: string[] = [];

    if (role && !Object.values(USER_ROLES).includes(role as any)) {
      errors.push(`Invalid role! Must be one of: ${Object.values(USER_ROLES).join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Comprehensive validation for all user data
   */
  static validateUserData(data: UserValidationData): ValidationResult {
    const errors: string[] = [];

    // Validate username
    const usernameValidation = this.validateUsername(data.username);
    if (!usernameValidation.isValid) {
      errors.push(...usernameValidation.errors);
    }

    // Validate email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // Validate password
    const passwordValidation = this.validatePassword(data.password, data.confirmPassword);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Validate role if provided
    if (data.role) {
      const roleValidation = this.validateRole(data.role);
      if (!roleValidation.isValid) {
        errors.push(...roleValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if user already exists by username or email
   */
  static async checkUserExists(username: string, email: string): Promise<{ exists: boolean; existingUser?: any }> {
    try {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            { email }
          ]
        },
        attributes: ['id', 'username', 'email'] // Only select needed fields for performance
      });

      return {
        exists: !!existingUser,
        existingUser: existingUser?.toJSON()
      };
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw new Error(MESSAGES.ERROR.USER.FAILED_TO_CHECK_USER_EXISTENCE);
    }
  }

  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error(MESSAGES.ERROR.USER.FAILED_TO_HASH_PASSWORD);
    }
  }

  /**
   * Determine if user should be active based on role
   */
  static shouldBeActive(role: string): boolean {
    return [USER_ROLES.ROLE_SUPER_ADMIN, USER_ROLES.ROLE_ADMIN, USER_ROLES.ROLE_STAFF].includes(role as any);
  }

  /**
   * Create user with validation and proper error handling
   */
  static async createUser(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<{ user: any; success: boolean; error?: string }> {
    try {
      // Check if user already exists
      const existenceCheck = await this.checkUserExists(userData.username, userData.email);
      if (existenceCheck.exists) {
        return {
          user: null,
          success: false,
          error: MESSAGES.ERROR.USER.USER_ALREADY_EXISTS
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Determine if user should be active
      const isActive = this.shouldBeActive(userData.role);

      // Create user
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive,
      });

      return {
        user: user.toJSON(),
        success: true
      };

    } catch (error) {
      console.error('Error creating user:', error);
      return {
        user: null,
        success: false,
        error: MESSAGES.ERROR.USER.FAILED_TO_CREATE_USER
      };
    }
  }

  /**
   * Get available roles for display
   */
  static getAvailableRoles(): { [key: string]: string } {
    return USER_ROLES;
  }

  /**
   * Get role descriptions for better UX
   */
  static getRoleDescriptions(): { [key: string]: string } {
    return {
      [USER_ROLES.ROLE_SUPER_ADMIN]: 'Super Admin - Full system access',
      [USER_ROLES.ROLE_ADMIN]: 'Admin - System management access',
      [USER_ROLES.ROLE_STAFF]: 'Staff - Limited management access',
      [USER_ROLES.ROLE_USER]: 'User - Standard user access',
      [USER_ROLES.ROLE_GUEST]: 'Guest - Read-only access'
    };
  }
}
