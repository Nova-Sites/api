import { Product, Category, ProductImage, TechStack, ProductTechStack } from '@/models';
import { IProduct, PaginationQuery, ProductFilters } from '@/types';
import { Op, Transaction } from 'sequelize';

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
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: TechStack,
          as: 'techStacks',
          attributes: ['id', 'name', 'slug', 'iconUrl'],
          through: { attributes: [] },
          where: { isActive: true },
          required: false,
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
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: TechStack,
          as: 'techStacks',
          attributes: ['id', 'name', 'slug', 'iconUrl'],
          through: { attributes: [] },
          where: { isActive: true },
          required: false,
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
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: TechStack,
          as: 'techStacks',
          attributes: ['id', 'name', 'slug', 'iconUrl'],
          through: { attributes: [] },
          where: { isActive: true },
          required: false,
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
    images?: string[];
    price: number;
    categoryId: number;
    techStackIds?: number[];
    createdBy?: number;
  }, transaction?: Transaction): Promise<IProduct> {
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const product = await Product.create({
      name: productData.name,
      description: productData.description,
      image: productData.image,
      price: productData.price,
      categoryId: productData.categoryId,
      ...(productData.createdBy && { createdBy: productData.createdBy }),
      slug,
      isActive: true,
    }, transaction ? { transaction } : {});

    // Create additional images
    if (productData.images && productData.images.length > 0) {
      const now = new Date();
      const imagePromises = productData.images.map((url, index) =>
        ProductImage.create({
          productId: product.id,
          url,
          sortOrder: index + 1,
          createdAt: now,
          updatedAt: now,
        } as any, transaction ? { transaction } : {})
      );
      await Promise.all(imagePromises);
    }

    // Associate tech stacks
    if (productData.techStackIds && productData.techStackIds.length > 0) {
      const now = new Date();
      const techStackPromises = productData.techStackIds.map(techId =>
        ProductTechStack.create({
          productId: product.id,
          techId,
          createdAt: now,
          updatedAt: now,
        } as any, transaction ? { transaction } : {})
      );
      await Promise.all(techStackPromises);
    }

    // Return product with relations
    return await this.getProductById(product.id) as IProduct;
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
      images?: string[];
      price?: number;
      categoryId?: number;
      techStackIds?: number[];
      isActive?: boolean;
      updatedBy?: number;
    },
    transaction?: Transaction
  ): Promise<IProduct | null> {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }

    // Update basic product data
    const { images, techStackIds, ...basicUpdateData } = updateData;
    await product.update(basicUpdateData, transaction ? { transaction } : {});

    // Update additional images
    if (images !== undefined) {
      // Delete existing images
      await ProductImage.destroy({ where: { productId: id }, ...(transaction && { transaction }) });
      
      // Create new images
      if (images.length > 0) {
        const now = new Date();
        const imagePromises = images.map((url, index) =>
          ProductImage.create({
            productId: id,
            url,
            sortOrder: index + 1,
            createdAt: now,
            updatedAt: now,
          } as any, transaction ? { transaction } : {})
        );
        await Promise.all(imagePromises);
      }
    }

    // Update tech stacks
    if (techStackIds !== undefined) {
      // Delete existing tech stack associations
      await ProductTechStack.destroy({ where: { productId: id }, ...(transaction && { transaction }) });
      
      // Create new associations
      if (techStackIds.length > 0) {
        const now = new Date();
        const techStackPromises = techStackIds.map(techId =>
          ProductTechStack.create({
            productId: id,
            techId,
            createdAt: now,
            updatedAt: now,
          } as any, transaction ? { transaction } : {})
        );
        await Promise.all(techStackPromises);
      }
    }

    // Return product with relations
    return await this.getProductById(id);
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
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: TechStack,
          as: 'techStacks',
          attributes: ['id', 'name', 'slug', 'iconUrl'],
          through: { attributes: [] },
          where: { isActive: true },
          required: false,
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
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: TechStack,
          as: 'techStacks',
          attributes: ['id', 'name', 'slug', 'iconUrl'],
          through: { attributes: [] },
          where: { isActive: true },
          required: false,
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
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: TechStack,
          as: 'techStacks',
          attributes: ['id', 'name', 'slug', 'iconUrl'],
          through: { attributes: [] },
          where: { isActive: true },
          required: false,
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
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: TechStack,
          as: 'techStacks',
          attributes: ['id', 'name', 'slug', 'iconUrl'],
          through: { attributes: [] },
          where: { isActive: true },
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit.toString()),
      offset,
    });

    return { count, products };
  }

  /**
   * Get products by tech stack
   */
  static async getProductsByTechStack(
    techStackId: number,
    pagination: PaginationQuery
  ): Promise<{ count: number; products: IProduct[] }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: TechStack,
          as: 'techStacks',
          attributes: ['id', 'name', 'slug', 'iconUrl'],
          through: { attributes: [] },
          where: { id: techStackId, isActive: true },
          required: true,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit.toString()),
      offset,
    });

    return { count, products };
  }
} 