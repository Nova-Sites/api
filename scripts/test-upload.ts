import fs from 'fs';
import path from 'path';
import { uploadImage, uploadAvatar, uploadMultipleImages, deleteImageByUrl, isCloudinaryConfigured } from '../src/utils/cloudinary';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function testUploadSystem() {
  console.log('🧪 Testing Upload System...\n');

  // Test 1: Check Cloudinary configuration
  console.log('1. Testing Cloudinary Configuration...');
  const isConfigured = isCloudinaryConfigured();
  console.log(`   Cloudinary configured: ${isConfigured ? '✅' : '❌'}`);
  
  if (!isConfigured) {
    console.log('   ❌ Please configure Cloudinary environment variables');
    console.log('   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    return;
  }

  // Test 2: Test with a sample image buffer (1x1 PNG)
  console.log('\n2. Testing Image Upload...');
  
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
      console.log('   ✅ Single image upload successful');
      console.log(`   📷 URL: ${uploadResult.url}`);
      console.log(`   🆔 Public ID: ${uploadResult.public_id}`);

      // Test delete image
      console.log('\n3. Testing Image Delete...');
      if (uploadResult.url) {
        const deleteResult = await deleteImageByUrl(uploadResult.url);
        if (deleteResult.success) {
          console.log('   ✅ Image delete successful');
        } else {
          console.log(`   ❌ Image delete failed: ${deleteResult.error}`);
        }
      }
    } else {
      console.log(`   ❌ Single image upload failed: ${uploadResult.error}`);
    }

  } catch (error) {
    console.log(`   ❌ Upload test error: ${error}`);
  }

  // Test 3: Test avatar upload
  console.log('\n4. Testing Avatar Upload...');
  try {
    const avatarResult = await uploadAvatar(sampleImageBuffer, 999);
    
    if (avatarResult.success) {
      console.log('   ✅ Avatar upload successful');
      console.log(`   👤 Avatar URL: ${avatarResult.url}`);
      
      // Clean up test avatar
      if (avatarResult.url) {
        await deleteImageByUrl(avatarResult.url);
        console.log('   🗑️ Test avatar cleaned up');
      }
    } else {
      console.log(`   ❌ Avatar upload failed: ${avatarResult.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Avatar test error: ${error}`);
  }

  // Test 4: Test multiple upload
  console.log('\n5. Testing Multiple Upload...');
  try {
    const multipleResults = await uploadMultipleImages(
      [sampleImageBuffer, sampleImageBuffer],
      'test',
      `multi_test_${Date.now()}`
    );

    const successCount = multipleResults.filter(result => result.success).length;
    const urls = multipleResults.filter(result => result.success).map(result => result.url!);
    
    if (successCount > 0) {
      console.log(`   ✅ Multiple upload successful: ${successCount}/${multipleResults.length}`);
      console.log(`   📷 URLs: ${urls.join(', ')}`);
      
      // Clean up test images
      if (urls.length > 0) {
        for (const url of urls) {
          await deleteImageByUrl(url);
        }
        console.log(`   🗑️ Cleanup: ${urls.length} images deleted`);
      }
    } else {
      console.log(`   ❌ Multiple upload failed`);
    }
  } catch (error) {
    console.log(`   ❌ Multiple upload test error: ${error}`);
  }

  console.log('\n🎉 Upload system test completed!');
}

// Run the test
if (require.main === module) {
  testUploadSystem().catch(console.error);
}

export { testUploadSystem };
