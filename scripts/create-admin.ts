#!/usr/bin/env ts-node

import sequelize from '../src/config/database';
import { UserValidationUtils } from '../src/utils/userValidation';
import { USER_ROLES } from '../src/constants';
import readline from 'readline';

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
    console.log('🚀 Creating Admin Account...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Get user input
    const username = await question('Enter username (3-50 characters, alphanumeric and underscore only): ');
    const email = await question('Enter email: ');
    const password = await question('Enter password (min 6 characters): ');
    const confirmPassword = await question('Confirm password: ');

    // Comprehensive validation using utility
    const validationData = { username, email, password, confirmPassword };
    const validation = UserValidationUtils.validateUserData(validationData);

    if (!validation.isValid) {
      console.error('❌ Validation errors:');
      validation.errors.forEach(error => console.error(`   - ${error}`));
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
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }

    const admin = result.user;
    console.log('\n✅ Admin account created successfully!');
    console.log('📋 Account Details:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    console.log(`   Created: ${admin.createdAt}`);
    console.log('\n🔐 You can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run the script
createAdmin();
