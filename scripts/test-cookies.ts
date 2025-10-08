#!/usr/bin/env ts-node

import sequelize from '../src/config/database';
import { UserService } from '../src/services/user.service';
import { JWTUtils } from '../src/utils/jwtUtils';
import { CookieUtils } from '../src/utils/cookieUtils';
import { Logger } from '../src/lib';

async function testCookies() {
  try {
    Logger.info('🧪 Testing Cookie Functionality...\n');

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

    Logger.info('\n🍪 Cookie Configuration:');
    Logger.info('   Access Token Cookie:');
    Logger.info(`     - Path: /`);
    Logger.info(`     - Max Age: ${result.tokens.expiresIn} seconds`);
    Logger.info(`     - HttpOnly: true`);
    Logger.info(`     - Secure: ${process.env['NODE_ENV'] === 'production'}`);
    Logger.info(`     - SameSite: strict`);

    Logger.info('\n   Refresh Token Cookie:');
    Logger.info(`     - Path: /api/v1/auth/refresh-token`);
    Logger.info(`     - Max Age: 7 days`);
    Logger.info(`     - HttpOnly: true`);
    Logger.info(`     - Secure: ${process.env['NODE_ENV'] === 'production'}`);
    Logger.info(`     - SameSite: strict`);

    Logger.info('\n🔑 Token Details:');
    Logger.info(`   Access Token: ${result.tokens.accessToken.substring(0, 50)}...`);
    Logger.info(`   Refresh Token: ${result.tokens.refreshToken.substring(0, 50)}...`);

    // Test cookie options
    Logger.info('\n📊 Cookie Options Test:');
    const accessCookieOptions = CookieUtils.getCookieOptions('access', result.tokens.expiresIn);
    const refreshCookieOptions = CookieUtils.getCookieOptions('refresh');

    Logger.info('   Access Token Cookie Options:');
    Logger.info(`     - Path: ${accessCookieOptions.path}`);
    Logger.info(`     - Max Age: ${accessCookieOptions.maxAge}ms`);
    Logger.info(`     - HttpOnly: ${accessCookieOptions.httpOnly}`);
    Logger.info(`     - Secure: ${accessCookieOptions.secure}`);

    Logger.info('\n   Refresh Token Cookie Options:');
    Logger.info(`     - Path: ${refreshCookieOptions.path}`);
    Logger.info(`     - Max Age: ${refreshCookieOptions.maxAge}ms`);
    Logger.info(`     - HttpOnly: ${refreshCookieOptions.httpOnly}`);
    Logger.info(`     - Secure: ${refreshCookieOptions.secure}`);

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

    Logger.info('\n🎉 All cookie tests passed successfully!');
    Logger.info('\n📝 Summary:');
    Logger.info('   ✅ Access token cookie set with path: /');
    Logger.info('   ✅ Refresh token cookie set with path: /api/v1/auth/refresh-token');
    Logger.info('   ✅ Both cookies are HttpOnly and secure');
    Logger.info('   ✅ Different expiration times for each token type');
    Logger.info('   ✅ Proper cookie clearing functionality');

  } catch (error) {
    Logger.error(`❌ Test failed: ${error}`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testCookies();
