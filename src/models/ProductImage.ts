import {
  Model,
  DataTypes,
  BelongsTo,
} from 'sequelize';
import sequelize from '@/config/database';
import { Product } from './Product';

export interface IProductImage {
  id: number;
  productId: number;
  url: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImageCreationAttributes {
  productId: number;
  url: string;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductImage extends Model<IProductImage, ProductImageCreationAttributes> {
  public id!: number;
  public productId!: number;
  public url!: string;
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static override associations: {
    product: BelongsTo<ProductImage, Product>;
  };
}

ProductImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      field: 'product_id',
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
      },
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
      field: 'sort_order',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'product_images',
    modelName: 'ProductImage',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ProductImage;
