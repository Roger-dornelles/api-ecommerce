import { sequelize } from './../instances/mysql';
import { DataTypes, Model } from 'sequelize';

export interface ImageInstance extends Model {
  id: number;
  userID: number;
  link: string;
}

const Images = sequelize.define<ImageInstance>(
  'Images',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'images',
  }
);

export default Images;
