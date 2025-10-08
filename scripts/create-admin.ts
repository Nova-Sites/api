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

async function createAdmin() {
  try {
    Logger.info('🚀 Creating Admin Account...\n');

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

    // Create admin using utility
    const result = await UserValidationUtils.createUser({
      username,
      email,
      password,
      role: USER_ROLES.ROLE_ADMIN
    });

    if (!result.success) {
      Logger.error(`❌ ${result.error}`);
      process.exit(1);
    }

    const admin = result.user;
    Logger.info('\n✅ Admin account created successfully!');
    Logger.info('📋 Account Details:');
    Logger.info(`   Username: ${admin.username}`);
    Logger.info(`   Email: ${admin.email}`);
    Logger.info(`   Role: ${admin.role}`);
    Logger.info(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    Logger.info(`   Created: ${admin.createdAt}`);
    Logger.info('\n🔐 You can now login with these credentials.');

  } catch (error) {
    Logger.error(`❌ Error creating admin account: ${error}` );
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run the script
createAdmin();
