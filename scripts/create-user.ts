#!/usr/bin/env ts-node

import sequelize from '../src/config/database';
import { UserValidationUtils } from '../src/utils/userValidation';
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

async function createUser() {
  try {
    console.log('🚀 Creating User Account...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Show available roles with descriptions
    console.log('Available roles:');
    const roleDescriptions = UserValidationUtils.getRoleDescriptions();
    Object.entries(roleDescriptions).forEach(([role, description]) => {
      console.log(`  ${role}: ${description}`);
    });
    console.log('');

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
      console.error('❌ Validation errors:');
      validation.errors.forEach(error => console.error(`   - ${error}`));
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
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }

    const user = result.user;
    console.log('\n✅ User account created successfully!');
    console.log('📋 Account Details:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    console.log(`   Created: ${user.createdAt}`);
    
    if (!user.isActive) {
      console.log('\n⚠️  Note: User account is inactive and requires OTP verification to activate.');
    } else {
      console.log('\n🔐 You can now login with these credentials.');
    }

  } catch (error) {
    console.error('❌ Error creating user account:', error);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// Run the script
createUser();
