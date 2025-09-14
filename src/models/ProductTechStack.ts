import {
  Model,
  DataTypes,
  BelongsTo,
} from 'sequelize';
import sequelize from '@/config/database';
import { Product } from './Product';
import { TechStack } from './TechStack';

export interface IProductTechStack {
  id: number;
  productId: number;
  techId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductTechStackCreationAttributes {
  productId: number;
  techId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductTechStack extends Model<IProductTechStack, ProductTechStackCreationAttributes> {
  public id!: number;
  public productId!: number;
  public techId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static override associations: {
    product: BelongsTo<ProductTechStack, Product>;
    techStack: BelongsTo<ProductTechStack, TechStack>;
  };
}

ProductTechStack.init(
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
    techId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tech_stacks',
        key: 'id',
      },
      field: 'tech_id',
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
    tableName: 'product_tech_stacks',
    modelName: 'ProductTechStack',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'tech_id'],
        name: 'unique_product_tech',
      },
      {
        fields: ['product_id'],
      },
      {
        fields: ['tech_id'],
      },
    ],
  }
);

export default ProductTechStack;
