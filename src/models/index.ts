import sequelize from '@/config/database';

// Import models
import { Category } from './Category';
import { Product } from './Product';
import { User } from './User';

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

};

// Initialize associations
initializeAssociations();

// Export models
export { Category, Product, User };

// Export sequelize instance
export default sequelize; 