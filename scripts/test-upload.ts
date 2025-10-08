import fs from 'fs';
import path from 'path';
import { uploadImage, uploadAvatar, uploadMultipleImages, deleteImageByUrl, isCloudinaryConfigured } from '../src/utils/cloudinary';
import { Logger } from '../src/lib';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function testUploadSystem() {
  Logger.info('🧪 Testing Upload System...\n');

  // Test 1: Check Cloudinary configuration
  Logger.info('1. Testing Cloudinary Configuration...');
  const isConfigured = isCloudinaryConfigured();
  Logger.info(`   Cloudinary configured: ${isConfigured ? '✅' : '❌'}`);
  
  if (!isConfigured) {
    Logger.info('   ❌ Please configure Cloudinary environment variables');
    Logger.info('   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    return;
  }

  // Test 2: Test with a sample image buffer (1x1 PNG)
  Logger.info('\n2. Testing Image Upload...');
  
  // Create a minimal 1x1 PNG image buffer for testing
  const sampleImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);

  try {
    // Test upload single image
    const uploadResult = await uploadImage(
      sampleImageBuffer,
      'test',
      `test_image_${Date.now()}`
    );

    if (uploadResult.success) {
      Logger.info('   ✅ Single image upload successful');
      Logger.info(`   📷 URL: ${uploadResult.url}`);
      Logger.info(`   🆔 Public ID: ${uploadResult.public_id}`);

      // Test delete image
      Logger.info('\n3. Testing Image Delete...');
      if (uploadResult.url) {
        const deleteResult = await deleteImageByUrl(uploadResult.url);
        if (deleteResult.success) {
          Logger.info('   ✅ Image delete successful');
        } else {
          Logger.info(`   ❌ Image delete failed: ${deleteResult.error}`);
        }
      }
    } else {
      Logger.info(`   ❌ Single image upload failed: ${uploadResult.error}`);
    }

  } catch (error) {
    Logger.info(`   ❌ Upload test error: ${error}`);
  }

  // Test 3: Test avatar upload
  Logger.info('\n4. Testing Avatar Upload...');
  try {
    const avatarResult = await uploadAvatar(sampleImageBuffer, 999);
    
    if (avatarResult.success) {
      Logger.info('   ✅ Avatar upload successful');
      Logger.info(`   👤 Avatar URL: ${avatarResult.url}`);
      
      // Clean up test avatar
      if (avatarResult.url) {
        await deleteImageByUrl(avatarResult.url);
        Logger.info('   🗑️ Test avatar cleaned up');
      }
    } else {
      Logger.info(`   ❌ Avatar upload failed: ${avatarResult.error}`);
    }
  } catch (error) {
    Logger.info(`   ❌ Avatar test error: ${error}`);
  }

  // Test 4: Test multiple upload
  Logger.info('\n5. Testing Multiple Upload...');
  try {
    const multipleResults = await uploadMultipleImages(
      [sampleImageBuffer, sampleImageBuffer],
      'test',
      `multi_test_${Date.now()}`
    );

    const successCount = multipleResults.filter(result => result.success).length;
    const urls = multipleResults.filter(result => result.success).map(result => result.url!);
    
    if (successCount > 0) {
      Logger.info(`   ✅ Multiple upload successful: ${successCount}/${multipleResults.length}`);
      Logger.info(`   📷 URLs: ${urls.join(', ')}`);
      
      // Clean up test images
      if (urls.length > 0) {
        for (const url of urls) {
          await deleteImageByUrl(url);
        }
        Logger.info(`   🗑️ Cleanup: ${urls.length} images deleted`);
      }
    } else {
      Logger.info(`   ❌ Multiple upload failed`);
    }
  } catch (error) {
    Logger.info(`   ❌ Multiple upload test error: ${error}`);
  }

  Logger.info('\n🎉 Upload system test completed!');
}

// Run the test
if (require.main === module) {
  testUploadSystem().catch(error => Logger.error(`❌ Test failed: ${error}`));
}

export { testUploadSystem };
