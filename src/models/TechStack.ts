import {
  Model,
  DataTypes,
  BelongsToMany,
} from 'sequelize';
import sequelize from '@/config/database';
import { Product } from './Product';

export interface ITechStack {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TechStackCreationAttributes {
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

export class TechStack extends Model<ITechStack, TechStackCreationAttributes> {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description?: string;
  public iconUrl?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static override associations: {
    products: BelongsToMany<TechStack, Product>;
  };
}

TechStack.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    iconUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
      field: 'icon_url',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
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
    tableName: 'tech_stacks',
    modelName: 'TechStack',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['slug'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['name'],
      },
    ],
  }
);

export default TechStack;
