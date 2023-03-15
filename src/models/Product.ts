import { sequelize } from '@/instances/mysql';
import { Model, DataTypes } from 'sequelize';

export interface ProductInstance extends Model {
  [x: string]: any;
  id: number;
  userID: number;
  name: string;
  description: string;
  photosID: number;
  state: string;
  isInstallments: boolean;
  value: number;
}

const Product = sequelize.define<ProductInstance>(
  'Product',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photosID: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isInstallments: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: 'product',
    timestamps: true,
  }
);

export default Product;
