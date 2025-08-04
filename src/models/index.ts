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

  Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
  });
};

// Initialize associations
initializeAssociations();

// Export models
export { Category, Product, User };

// Export sequelize instance
export default sequelize; 