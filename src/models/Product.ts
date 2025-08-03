import {
  Model,
  DataTypes,
  BelongsTo,
} from 'sequelize';
import sequelize from '@/config/database';
import { IProduct } from '@/types';
import { Category } from './Category';

export interface ProductCreationAttributes {
  name: string;
  description: string;
  image: string;
  price: number;
  slug: string;
  categoryId: number;
  isActive?: boolean;
}

export class Product extends Model<IProduct, ProductCreationAttributes> {
  public id!: number;
  public name!: string;
  public description!: string;
  public image!: string;
  public price!: number;
  public views!: number;
  public slug!: string;
  public categoryId!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static override associations: {
    category: BelongsTo<Product, Category>;
  };
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 2000],
      },
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'products',
    modelName: 'Product',
  }
);

export default Product; 