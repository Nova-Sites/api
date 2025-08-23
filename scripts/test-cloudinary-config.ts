import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

async function testCloudinaryConfig() {
  console.log('🔧 Testing Cloudinary Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  CLOUDINARY_CLOUD_NAME:', process.env['CLOUDINARY_CLOUD_NAME'] || 'NOT SET');
  console.log('  CLOUDINARY_API_KEY:', process.env['CLOUDINARY_API_KEY'] ? '***' + process.env['CLOUDINARY_API_KEY'].slice(-4) : 'NOT SET');
  console.log('  CLOUDINARY_API_SECRET:', process.env['CLOUDINARY_API_SECRET'] ? '***' + process.env['CLOUDINARY_API_SECRET'].slice(-4) : 'NOT SET');

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env['CLOUDINARY_CLOUD_NAME'] || '',
    api_key: process.env['CLOUDINARY_API_KEY'] || '',
    api_secret: process.env['CLOUDINARY_API_SECRET'] || '',
  });

  console.log('\n🔍 Cloudinary Config:');
  const config = cloudinary.config();
  console.log('  Cloud Name:', config.cloud_name);
  console.log('  API Key:', config.api_key ? '***' + config.api_key.slice(-4) : 'NOT SET');
  console.log('  API Secret:', config.api_secret ? '***' + config.api_secret.slice(-4) : 'NOT SET');

  // Test simple API call
  try {
    console.log('\n🧪 Testing Cloudinary API...');
    
    // Try to get account info
    const result = await new Promise((resolve, reject) => {
      cloudinary.api.ping((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    console.log('✅ Cloudinary API test successful:', result);
    
  } catch (error: any) {
    console.error('❌ Cloudinary API test failed:', error);
    console.error('  Error message:', error.message);
    console.error('  HTTP code:', error.http_code);
  }
}

// Run the test
if (require.main === module) {
  testCloudinaryConfig().catch(console.error);
}

export { testCloudinaryConfig };
