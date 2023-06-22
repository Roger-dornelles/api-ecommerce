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
  securityCode: number;
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
    securityCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    total: {
      type: DataTypes.STRING,
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
    userProductDataOfPurchase: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    cardName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    complement: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dueDate: {
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
