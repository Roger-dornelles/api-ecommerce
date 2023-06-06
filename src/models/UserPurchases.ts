import { sequelize } from '@/instances/mysql';
import { Model, DataTypes } from 'sequelize';

export interface UserPurchasesInstance extends Model {
  id: number;
  userID: number;
  name: string;
  photosID: string;
  numberParcelOfValue: string;
  quantity: number;
  total: string;
  numberOfCard: string;
  lastNumbersOfCard: string;
}

const UserPurchases = sequelize.define<UserPurchasesInstance>(
  'UserPurchases',
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
    photosID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numberParcelOfValue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberOfCard: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastNumbersOfCard: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'userPurchases',
    timestamps: true,
  }
);

export default UserPurchases;
