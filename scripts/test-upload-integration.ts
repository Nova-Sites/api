import { uploadImage, uploadAvatar, uploadMultipleImages, deleteImageByUrl } from '../src/utils/cloudinary';
import { isCloudinaryConfigured } from '../src/utils/cloudinary';
import { Logger } from '../src/lib';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function testUploadIntegration() {
  Logger.info('🧪 Testing Upload Integration for Product, Category, and User...\n');

  // Test 1: Check Cloudinary configuration
  Logger.info('1. Testing Cloudinary Configuration...');
  const isConfigured = isCloudinaryConfigured();
  Logger.info(`   Cloudinary configured: ${isConfigured ? '✅' : '❌'}`);
  
  if (!isConfigured) {
    Logger.error('   ❌ Please configure Cloudinary environment variables');
    Logger.error('   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    return;
  }

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

  // Test 2: Test Category Image Upload
  Logger.info('\n2. Testing Category Image Upload...');
  try {
    const categoryResult = await uploadImage(
      sampleImageBuffer,
      'categories',
      `test_category_${Date.now()}`
    );

    if (categoryResult.success) {
      Logger.info('   ✅ Category image upload successful');
      Logger.info(`   📷 URL: ${categoryResult.url}`);
      Logger.info(`   🆔 Public ID: ${categoryResult.public_id}`);

      // Clean up test category image
      if (categoryResult.url) {
        const deleteResult = await deleteImageByUrl(categoryResult.url);
        if (deleteResult.success) {
          Logger.info('   🗑️ Test category image cleaned up');
        }
      }
    } else {
      Logger.error(`   ❌ Category image upload failed: ${categoryResult.error}`);
    }
  } catch (error) {
    Logger.error(`   ❌ Category upload test error: ${error}`);
  }

  // Test 3: Test Product Image Upload
  Logger.info('\n3. Testing Product Image Upload...');
  try {
          const productResult = await uploadImage(
      sampleImageBuffer,
      'products',
      `test_product_${Date.now()}`
    );

    if (productResult.success) {
      Logger.info('   ✅ Product image upload successful');
      Logger.info(`   📷 URL: ${productResult.url}`);
      Logger.info(`   🆔 Public ID: ${productResult.public_id}`);

      // Clean up test product image
      if (productResult.url) {
        const deleteResult = await deleteImageByUrl(productResult.url);
        if (deleteResult.success) {
          Logger.info('   🗑️ Test product image cleaned up');
        }
      }
    } else {
      Logger.error(`   ❌ Product image upload failed: ${productResult.error}`);
    }
  } catch (error) {
    Logger.error(`   ❌ Product upload test error: ${error}`);
  }

  // Test 4: Test User Avatar Upload
  Logger.info('\n4. Testing User Avatar Upload...');
  try {
          const avatarResult = await uploadAvatar(sampleImageBuffer, 999);
    
    if (avatarResult.success) {
      Logger.info('   ✅ User avatar upload successful');
      Logger.info(`   👤 Avatar URL: ${avatarResult.url}`);
      
      // Clean up test avatar
      if (avatarResult.url) {
        const deleteResult = await deleteImageByUrl(avatarResult.url);
        if (deleteResult.success) {
          Logger.info('   🗑️ Test avatar cleaned up');
        }
      }
    } else {
      Logger.error(`   ❌ User avatar upload failed: ${avatarResult.error}`);
    }
  } catch (error) {
    Logger.error(`   ❌ User avatar test error: ${error}`);
  }

  // Test 5: Test Multiple Images Upload
  Logger.info('\n5. Testing Multiple Images Upload...');
  try {
          const multipleResults = await uploadMultipleImages(
      [sampleImageBuffer, sampleImageBuffer],
      'test'
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
        Logger.error(`   ❌ Multiple upload failed`);
      }
  } catch (error) {
    Logger.error(`   ❌ Multiple upload test error: ${error}`);
  }

  Logger.info('\n🎉 Upload integration test completed!');
  Logger.info('\n📋 Summary:');
  Logger.info('   - Category images: Upload to "categories" folder');
  Logger.info('   - Product images: Upload to "products" folder');
  Logger.info('   - User avatars: Upload to "avatars" folder with user ID');
  Logger.info('   - All images are optimized and converted to WebP format');
  Logger.info('   - Automatic cleanup of old images when updating');
}

// Run the test
if (require.main === module) {
  testUploadIntegration().catch(error => Logger.error(`❌ Test failed: ${error}`));
}

export { testUploadIntegration };
