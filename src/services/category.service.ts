import { Category } from '@/models';
import { ICategory } from '@/types';
import { Op } from 'sequelize';

export class CategoryService {
  /**
   * Get all active categories
   */
  static async getAllCategories(): Promise<ICategory[]> {
    return await Category.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: number): Promise<ICategory | null> {
    return await Category.findByPk(id);
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({
      where: { slug, isActive: true },
    });
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryData: {
    name: string;
    image: string;
    description?: string;
    createdBy?: number;
  }): Promise<ICategory> {
    const slug = categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    return await Category.create({
      ...categoryData,
      slug,
      isActive: true,
    });
  }

  /**
   * Update category by ID
   */
  static async updateCategory(
    id: number,
    updateData: {
      name?: string;
      image?: string;
      description?: string;
      isActive?: boolean;
      updatedBy?: number;
    }
  ): Promise<ICategory | null> {
    const category = await Category.findByPk(id);
    if (!category) {
      return null;
    }

    await category.update(updateData);
    return category;
  }

  /**
   * Delete category by ID (soft delete)
   */
  static async deleteCategory(id: number, updatedBy?: number): Promise<boolean> {
    const category = await Category.findByPk(id);
    if (!category) {
      return false;
    }

    await category.update({ isActive: false, updatedBy: updatedBy ?? null });
    return true;
  }

  /**
   * Search categories by name
   */
  static async searchCategories(searchTerm: string): Promise<ICategory[]> {
    return await Category.findAll({
      where: {
        name: {
          [Op.iLike]: `%${searchTerm}%`,
        },
        isActive: true,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get categories with product count
   */
  static async getCategoriesWithProductCount(): Promise<ICategory[]> {
    return await Category.findAll({
      where: { isActive: true },
      attributes: {
        include: [
          [
            Category.sequelize?.literal('(SELECT COUNT(*) FROM products WHERE products.category_id = Category.id AND products.is_active = true)') || '0',
            'productCount',
          ],
        ],
      },
      order: [['createdAt', 'DESC']],
    });
  }
} 