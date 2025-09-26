import { TechStack, Product } from "@/models";
import {
  ITechStack,
  PaginationQuery,
  TechStackCreationAttributes,
  TechStackFilters,
} from "@/types";
import { Op } from "sequelize";

export class TechStackService {
  /**
   * Get all tech stacks with optional filtering
   */
  static async getAllTechStacks(
    filters: TechStackFilters = {},
    pagination: PaginationQuery
  ): Promise<{ count: number; techStacks: ITechStack[] }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = pagination;
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    if (filters.search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { slug: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { count, rows: techStacks } = await TechStack.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      offset,
      limit,
    });

    return {
      count,
      techStacks,
    };
  }

  /**
   * Get tech stack by ID
   */
  static async getTechStackById(id: number): Promise<ITechStack | null> {
    return await TechStack.findByPk(id);
  }

  /**
   * Get tech stack by ID with products
   */
  static async getTechStackByIdWithProducts(
    id: number
  ): Promise<ITechStack | null> {
    return await TechStack.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: [] },
          attributes: ["id", "name", "slug", "image", "price"],
        },
      ],
    });
  }

  /**
   * Get tech stack by slug
   */
  static async getTechStackBySlug(slug: string): Promise<ITechStack | null> {
    return await TechStack.findOne({
      where: { slug },
    });
  }

  /**
   * Get tech stack by slug with products
   */
  static async getTechStackBySlugWithProducts(
    slug: string
  ): Promise<ITechStack | null> {
    return await TechStack.findOne({
      where: { slug },
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: [] },
          attributes: ["id", "name", "slug", "image", "price"],
        },
      ],
    });
  }

  /**
   * Create new tech stack
   */
  static async createTechStack(
    data: TechStackCreationAttributes
  ): Promise<ITechStack> {
    return await TechStack.create(data);
  }

  /**
   * Update tech stack
   */
  static async updateTechStack(
    id: number,
    data: Partial<TechStackCreationAttributes>
  ): Promise<ITechStack | null> {
    const techStack = await TechStack.findByPk(id);
    if (!techStack) {
      return null;
    }

    await techStack.update(data);
    return techStack;
  }

  /**
   * Delete tech stack
   */
  static async deleteTechStack(id: number): Promise<boolean> {
    const techStack = await TechStack.findByPk(id);
    if (!techStack) {
      return false;
    }

    await techStack.destroy();
    return true;
  }

  /**
   * Check if slug exists
   */
  static async isSlugExists(
    slug: string,
    excludeId?: number
  ): Promise<boolean> {
    const whereClause: any = { slug };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingTechStack = await TechStack.findOne({ where: whereClause });
    return !!existingTechStack;
  }

  /**
   * Search tech stacks
   */
  static async searchTechStacks(searchTerm: string): Promise<ITechStack[]> {
    return await TechStack.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { slug: { [Op.like]: `%${searchTerm}%` } },
          { description: { [Op.like]: `%${searchTerm}%` } },
        ],
        isActive: true,
      },
      order: [["name", "ASC"]],
    });
  }

  /**
   * Get tech stacks with product count
   */
  static async getTechStacksWithProductCount(): Promise<any[]> {
    const techStacks = await TechStack.findAll({
      where: { isActive: true },
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: [] },
          attributes: ["id"],
        },
      ],
      order: [["name", "ASC"]],
    });

    return techStacks.map((techStack) => {
      const techStackData = techStack.toJSON() as any;
      return {
        ...techStackData,
        productCount: techStackData.products?.length || 0,
      };
    });
  }

  /**
   * Get popular tech stacks (by product count)
   */
  static async getPopularTechStacks(limit: number = 10): Promise<any[]> {
    const techStacks = await TechStack.findAll({
      where: { isActive: true },
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: [] },
          attributes: ["id"],
        },
      ],
      order: [["name", "ASC"]],
    });

    return techStacks
      .map((techStack) => {
        const techStackData = techStack.toJSON() as any;
        return {
          ...techStackData,
          productCount: techStackData.products?.length || 0,
        };
      })
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, limit);
  }

  /**
   * Get tech stacks by IDs
   */
  static async getTechStacksByIds(ids: number[]): Promise<ITechStack[]> {
    return await TechStack.findAll({
      where: {
        id: { [Op.in]: ids },
        isActive: true,
      },
      order: [["name", "ASC"]],
    });
  }

  /**
   * Toggle tech stack active status
   */
  static async toggleTechStackStatus(id: number): Promise<ITechStack | null> {
    const techStack = await TechStack.findByPk(id);
    if (!techStack) {
      return null;
    }

    await techStack.update({ isActive: !techStack.isActive });
    return techStack;
  }

  /**
   * Get tech stack statistics
   */
  static async getTechStackStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withProducts: number;
  }> {
    const [total, active, inactive, withProducts] = await Promise.all([
      TechStack.count(),
      TechStack.count({ where: { isActive: true } }),
      TechStack.count({ where: { isActive: false } }),
      TechStack.count({
        include: [
          {
            model: Product,
            as: "products",
            through: { attributes: [] },
            required: true,
          },
        ],
      }),
    ]);

    return {
      total,
      active,
      inactive,
      withProducts,
    };
  }
}
