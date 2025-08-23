import { Product, Category } from '@/models';
import { IProduct, PaginationQuery, ProductFilters } from '@/types';
import { Op } from 'sequelize';

export class ProductService {
  /**
   * Get all products with pagination and filtering
   */
  static async getAllProducts(
    filters: ProductFilters = {},
    pagination: PaginationQuery
  ): Promise<{ count: number; products: IProduct[] }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const where: any = { isActive: true };

    // Apply filters
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price[Op.gte] = filters.minPrice;
      if (filters.maxPrice) where.price[Op.lte] = filters.maxPrice;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
          where: { isActive: true },
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit.toString()),
      offset,
    });

    return { count, products };
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: number): Promise<IProduct | null> {
    return await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string): Promise<IProduct | null> {
    return await Product.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: {
    name: string;
    description: string;
    image: string;
    price: number;
    categoryId: number;
    createdBy?: number;
  }): Promise<IProduct> {
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    return await Product.create({
      ...productData,
      slug,
      isActive: true,
    });
  }

  /**
   * Update product by ID
   */
  static async updateProduct(
    id: number,
    updateData: {
      name?: string;
      description?: string;
      image?: string;
      price?: number;
      categoryId?: number;
      isActive?: boolean;
      updatedBy?: number;
    }
  ): Promise<IProduct | null> {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }

    await product.update(updateData);
    return product;
  }

  /**
   * Delete product by ID (soft delete)
   */
  static async deleteProduct(id: number, updatedBy?: number): Promise<boolean> {
    const product = await Product.findByPk(id);
    if (!product) {
      return false;
    }

    await product.update({ isActive: false, updatedBy: updatedBy ?? null });
    return true;
  }

  /**
   * Increment product views
   */
  static async incrementViews(id: number): Promise<void> {
    await Product.increment('views', { where: { id } });
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    categoryId: number,
    pagination: PaginationQuery
  ): Promise<{ count: number; products: IProduct[] }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: { categoryId, isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit.toString()),
      offset,
    });

    return { count, products };
  }

  /**
   * Get featured products (most viewed)
   */
  static async getFeaturedProducts(limit: number = 10): Promise<IProduct[]> {
    return await Product.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['views', 'DESC']],
      limit,
    });
  }

  /**
   * Search products
   */
  static async searchProducts(
    searchTerm: string,
    pagination: PaginationQuery
  ): Promise<{ count: number; products: IProduct[] }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit.toString()),
      offset,
    });

    return { count, products };
  }

  /**
   * Get products by price range
   */
  static async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
    pagination: PaginationQuery
  ): Promise<{ count: number; products: IProduct[] }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        isActive: true,
        price: {
          [Op.between]: [minPrice, maxPrice],
        },
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit.toString()),
      offset,
    });

    return { count, products };
  }
} 