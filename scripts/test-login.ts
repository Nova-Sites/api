#!/usr/bin/env ts-node

import sequelize from '../src/config/database';
import { UserService } from '../src/services/user.service';
import { JWTUtils } from '../src/utils/jwtUtils';

async function testLogin() {
  try {
    console.log('🧪 Testing Login Functionality...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Test credentials
    const testEmail = 'tuandtdeveloper@gmail.com';
    const testPassword = 'Tuandoan@123';

    console.log(`🔐 Testing login with email: ${testEmail}`);

    // Test authentication
    const result = await UserService.authenticateUser(testEmail, testPassword);
    
    console.log('✅ Login successful!');
    console.log('📋 User Details:');
    console.log(`   ID: ${result.user.id}`);
    console.log(`   Username: ${result.user.username}`);
    console.log(`   Email: ${result.user.email}`);
    console.log(`   Role: ${result.user.role}`);
    console.log(`   Status: ${result.user.isActive ? 'Active' : 'Inactive'}`);

    console.log('\n🔑 Token Details:');
    console.log(`   Access Token: ${result.tokens.accessToken.substring(0, 50)}...`);
    console.log(`   Refresh Token: ${result.tokens.refreshToken.substring(0, 50)}...`);
    console.log(`   Expires In: ${result.tokens.expiresIn} seconds`);

    // Test token verification
    console.log('\n🔍 Testing token verification...');
    const decoded = JWTUtils.verifyAccessToken(result.tokens.accessToken);
    console.log('✅ Access token verified successfully!');
    console.log(`   User ID: ${decoded.userId}`);
    console.log(`   Username: ${decoded.username}`);
    console.log(`   Role: ${decoded.role}`);

    // Test refresh token
    console.log('\n🔄 Testing refresh token...');
    const refreshResult = await UserService.refreshAccessToken(result.tokens.refreshToken);
    console.log('✅ Refresh token works successfully!');
    console.log(`   New Access Token: ${refreshResult.tokens.accessToken.substring(0, 50)}...`);

    // Test token info
    console.log('\n📊 Token Information:');
    const tokenInfo = JWTUtils.getTokenInfo(result.tokens.accessToken);
    console.log(`   Valid: ${tokenInfo.isValid}`);
    console.log(`   Expired: ${tokenInfo.isExpired}`);
    if (tokenInfo.payload) {
      console.log(`   Issued At: ${new Date(tokenInfo.payload.iat * 1000).toISOString()}`);
      console.log(`   Expires At: ${new Date(tokenInfo.payload.exp * 1000).toISOString()}`);
    }

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testLogin();
