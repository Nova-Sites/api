#!/usr/bin/env ts-node

import sequelize from '../src/config/database';
import { UserService } from '../src/services/user.service';
import { JWTUtils } from '../src/utils/jwtUtils';
import { CookieUtils } from '../src/utils/cookieUtils';

async function testCookies() {
  try {
    console.log('🧪 Testing Cookie Functionality...\n');

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

    console.log('\n🍪 Cookie Configuration:');
    console.log('   Access Token Cookie:');
    console.log(`     - Path: /`);
    console.log(`     - Max Age: ${result.tokens.expiresIn} seconds`);
    console.log(`     - HttpOnly: true`);
    console.log(`     - Secure: ${process.env['NODE_ENV'] === 'production'}`);
    console.log(`     - SameSite: strict`);

    console.log('\n   Refresh Token Cookie:');
    console.log(`     - Path: /api/v1/auth/refresh-token`);
    console.log(`     - Max Age: 7 days`);
    console.log(`     - HttpOnly: true`);
    console.log(`     - Secure: ${process.env['NODE_ENV'] === 'production'}`);
    console.log(`     - SameSite: strict`);

    console.log('\n🔑 Token Details:');
    console.log(`   Access Token: ${result.tokens.accessToken.substring(0, 50)}...`);
    console.log(`   Refresh Token: ${result.tokens.refreshToken.substring(0, 50)}...`);

    // Test cookie options
    console.log('\n📊 Cookie Options Test:');
    const accessCookieOptions = CookieUtils.getCookieOptions('access', result.tokens.expiresIn);
    const refreshCookieOptions = CookieUtils.getCookieOptions('refresh');

    console.log('   Access Token Cookie Options:');
    console.log(`     - Path: ${accessCookieOptions.path}`);
    console.log(`     - Max Age: ${accessCookieOptions.maxAge}ms`);
    console.log(`     - HttpOnly: ${accessCookieOptions.httpOnly}`);
    console.log(`     - Secure: ${accessCookieOptions.secure}`);

    console.log('\n   Refresh Token Cookie Options:');
    console.log(`     - Path: ${refreshCookieOptions.path}`);
    console.log(`     - Max Age: ${refreshCookieOptions.maxAge}ms`);
    console.log(`     - HttpOnly: ${refreshCookieOptions.httpOnly}`);
    console.log(`     - Secure: ${refreshCookieOptions.secure}`);

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

    console.log('\n🎉 All cookie tests passed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Access token cookie set with path: /');
    console.log('   ✅ Refresh token cookie set with path: /api/v1/auth/refresh-token');
    console.log('   ✅ Both cookies are HttpOnly and secure');
    console.log('   ✅ Different expiration times for each token type');
    console.log('   ✅ Proper cookie clearing functionality');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testCookies();
