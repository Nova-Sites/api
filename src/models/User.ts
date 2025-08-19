import {
  Model,
  DataTypes,
  BelongsTo,
} from 'sequelize';
import sequelize from '@/config/database';
import { IUser } from '@/types';
import { USER_ROLES } from '@/constants';

export interface UserCreationAttributes {
  username: string;
  email: string;
  password: string;
  isActive?: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  image?: string;
  role?: string;
}

export class User extends Model<IUser, UserCreationAttributes> {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public isActive!: boolean;
  public otp?: string | null;
  public otpExpiresAt?: Date | null;
  public image?: string;
  public role!: string;
  public createdBy!: number | null;
  public updatedBy!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static override associations: {
    creator?: BelongsTo<User, User>;
    updater?: BelongsTo<User, User>;
  };
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
        is: /^[a-zA-Z0-9_]+$/, // Only alphanumeric and underscore
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
      validate: {
        len: [6, 6],
        isNumeric: true,
      },
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLES)),
      allowNull: false,
      defaultValue: USER_ROLES.ROLE_USER,
      validate: {
        isIn: [Object.values(USER_ROLES)],
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
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
    tableName: 'users',
    modelName: 'User',
  }
);

export default User; 