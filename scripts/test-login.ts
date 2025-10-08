#!/usr/bin/env ts-node

import sequelize from '../src/config/database';
import { UserService } from '../src/services/user.service';
import { JWTUtils } from '../src/utils/jwtUtils';
import { Logger } from '../src/lib';

async function testLogin() {
  try {
    Logger.info('🧪 Testing Login Functionality...\n');

    // Test database connection
    await sequelize.authenticate();
    Logger.info('✅ Database connection established successfully.\n');

    // Test credentials
    const testEmail = 'tuandtdeveloper@gmail.com';
    const testPassword = 'Tuandoan@123';

    Logger.info(`🔐 Testing login with email: ${testEmail}`);

    // Test authentication
    const result = await UserService.authenticateUser(testEmail, testPassword);
    
    Logger.info('✅ Login successful!');
    Logger.info('📋 User Details:');
    Logger.info(`   ID: ${result.user.id}`);
    Logger.info(`   Username: ${result.user.username}`);
    Logger.info(`   Email: ${result.user.email}`);
    Logger.info(`   Role: ${result.user.role}`);
    Logger.info(`   Status: ${result.user.isActive ? 'Active' : 'Inactive'}`);

    Logger.info('\n🔑 Token Details:');
    Logger.info(`   Access Token: ${result.tokens.accessToken.substring(0, 50)}...`);
    Logger.info(`   Refresh Token: ${result.tokens.refreshToken.substring(0, 50)}...`);
    Logger.info(`   Expires In: ${result.tokens.expiresIn} seconds`);

    // Test token verification
    Logger.info('\n🔍 Testing token verification...');
    const decoded = JWTUtils.verifyAccessToken(result.tokens.accessToken);
    Logger.info('✅ Access token verified successfully!');
    Logger.info(`   User ID: ${decoded.userId}`);
    Logger.info(`   Username: ${decoded.username}`);
    Logger.info(`   Role: ${decoded.role}`);

    // Test refresh token
    Logger.info('\n🔄 Testing refresh token...');
    const refreshResult = await UserService.refreshAccessToken(result.tokens.refreshToken);
    Logger.info('✅ Refresh token works successfully!');
    Logger.info(`   New Access Token: ${refreshResult.tokens.accessToken.substring(0, 50)}...`);

    // Test token info
    Logger.info('\n📊 Token Information:');
    const tokenInfo = JWTUtils.getTokenInfo(result.tokens.accessToken);
    Logger.info(`   Valid: ${tokenInfo.isValid}`);
    Logger.info(`   Expired: ${tokenInfo.isExpired}`);
    if (tokenInfo.payload) {
      Logger.info(`   Issued At: ${new Date(tokenInfo.payload.iat * 1000).toISOString()}`);
      Logger.info(`   Expires At: ${new Date(tokenInfo.payload.exp * 1000).toISOString()}`);
    }

    Logger.info('\n🎉 All tests passed successfully!');

  } catch (error) {
    Logger.error(`❌ Test failed: ${error}`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testLogin();
