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

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Super Admin Account...\n');

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

    // Create super admin using utility
    const result = await UserValidationUtils.createUser({
      username,
      email,
      password,
      role: USER_ROLES.ROLE_SUPER_ADMIN
    });

    if (!result.success) {
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }

    const superAdmin = result.user;
    console.log('\n✅ Super Admin account created successfully!');
    console.log('📋 Account Details:');
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Status: ${superAdmin.isActive ? 'Active' : 'Inactive'}`);
    console.log(`   Created: ${superAdmin.createdAt}`);
    console.log('\n🔐 You can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error creating super admin account:', error);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run the script
createSuperAdmin();
