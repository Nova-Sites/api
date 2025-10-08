#!/usr/bin/env ts-node

import sequelize from '../src/config/database';
import { UserValidationUtils } from '../src/utils/userValidation';
import readline from 'readline';
import { Logger } from '../src/lib';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createUser() {
  try {
    Logger.info('🚀 Creating User Account...\n');

    // Test database connection
    await sequelize.authenticate();
    Logger.info('✅ Database connection established successfully.\n');

    // Show available roles with descriptions
    Logger.info('Available roles:');
    const roleDescriptions = UserValidationUtils.getRoleDescriptions();
    Object.entries(roleDescriptions).forEach(([role, description]) => {
      Logger.info(`  ${role}: ${description}`);
    });
    Logger.info('');

    // Get user input
    const username = await question('Enter username (3-50 characters, alphanumeric and underscore only): ');
    const email = await question('Enter email: ');
    const password = await question('Enter password (min 6 characters): ');
    const confirmPassword = await question('Confirm password: ');
    const role = await question(`Enter role (${Object.keys(roleDescriptions).join(' | ')}): `);

    // Comprehensive validation using utility
    const validationData = { username, email, password, confirmPassword, role };
    const validation = UserValidationUtils.validateUserData(validationData);

    if (!validation.isValid) {
      validation.errors.forEach(error => Logger.error(`   - ${error}`));
      process.exit(1);
    }

    // Create user using utility
    const result = await UserValidationUtils.createUser({
      username,
      email,
      password,
      role
    });

    if (!result.success) {
      Logger.error(`❌ ${result.error}`);
      process.exit(1);
    }

    const user = result.user;
    Logger.info('\n✅ User account created successfully!');
    Logger.info('📋 Account Details:');
    Logger.info(`   Username: ${user.username}`);
    Logger.info(`   Email: ${user.email}`);
    Logger.info(`   Role: ${user.role}`);
    Logger.info(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    Logger.info(`   Created: ${user.createdAt}`);
    
    if (!user.isActive) {
      Logger.info('\n⚠️  Note: User account is inactive and requires OTP verification to activate.');
    } else {
      Logger.info('\n🔐 You can now login with these credentials.');
    }

  } catch (error) {
    Logger.error(`❌ Error creating user account: ${error}`);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run the script
createUser();
