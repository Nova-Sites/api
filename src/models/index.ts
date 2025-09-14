import sequelize from '@/config/database';

// Import models
import { Category } from './Category';
import { Product } from './Product';
import { User } from './User';
import { ProductImage } from './ProductImage';
import { TechStack } from './TechStack';
import { ProductTechStack } from './ProductTechStack';

// Initialize associations after all models are loaded
const initializeAssociations = () => {
  Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products',
  });

  // Category createdBy and updatedBy associations to User
  Category.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  Category.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  });
  
  Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
  });

  // Product createdBy and updatedBy associations to User
  Product.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  Product.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  });

  // User createdBy and updatedBy associations to User
  User.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
  
  User.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  });

  // ProductImage associations
  ProductImage.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
  });

  Product.hasMany(ProductImage, {
    foreignKey: 'productId',
    as: 'images',
  });

  // ProductTechStack associations
  ProductTechStack.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
  });

  ProductTechStack.belongsTo(TechStack, {
    foreignKey: 'techId',
    as: 'techStack',
  });

  // Many-to-many associations between Product and TechStack
  Product.belongsToMany(TechStack, {
    through: ProductTechStack,
    foreignKey: 'productId',
    otherKey: 'techId',
    as: 'techStacks',
  });

  TechStack.belongsToMany(Product, {
    through: ProductTechStack,
    foreignKey: 'techId',
    otherKey: 'productId',
    as: 'products',
  });

};

// Initialize associations
initializeAssociations();

// Export models
export { Category, Product, User, ProductImage, TechStack, ProductTechStack };

// Export sequelize instance
export default sequelize; 