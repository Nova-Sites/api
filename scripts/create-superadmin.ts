#!/usr/bin/env ts-node

import sequelize from '../src/config/database';
import { UserValidationUtils } from '../src/utils/userValidation';
import { USER_ROLES } from '../src/constants';
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

async function createSuperAdmin() {
  try {
    Logger.info('🚀 Creating Super Admin Account...\n');

    // Test database connection
    await sequelize.authenticate();
    Logger.info('✅ Database connection established successfully.');

    // Get user input
    const username = await question('Enter username (3-50 characters, alphanumeric and underscore only): ');
    const email = await question('Enter email: ');
    const password = await question('Enter password (min 6 characters): ');
    const confirmPassword = await question('Confirm password: ');

    // Comprehensive validation using utility
    const validationData = { username, email, password, confirmPassword };
    const validation = UserValidationUtils.validateUserData(validationData);

    if (!validation.isValid) {
      validation.errors.forEach(error => Logger.error(`   - ${error}`));
      process.exit(1);
    }

    // Create super admin using utility
    const result = await UserValidationUtils.createUser({
      username,
      email,
      password,
      role: USER_ROLES.ROLE_SUPER_ADMIN
    });

    if (!result.success) {
      Logger.error(`❌ ${result.error}`);
      process.exit(1);
    }

    const superAdmin = result.user;
    Logger.info('\n✅ Super Admin account created successfully!');
    Logger.info('📋 Account Details:');
    Logger.info(`   Username: ${superAdmin.username}`);
    Logger.info(`   Email: ${superAdmin.email}`);
    Logger.info(`   Role: ${superAdmin.role}`);
    Logger.info(`   Status: ${superAdmin.isActive ? 'Active' : 'Inactive'}`);
    Logger.info(`   Created: ${superAdmin.createdAt}`);
    Logger.info('\n🔐 You can now login with these credentials.');

  } catch (error) {
    Logger.error(`❌ Error creating super admin account: ${error}`);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run the script
createSuperAdmin();
