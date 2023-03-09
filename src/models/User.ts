import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/instances/mysql';

export interface CreateUserInstance extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  cpf: string;
  logradouro: string;
  number: number;
  contact: string;
  state: string;
}

export const User = sequelize.define<CreateUserInstance>(
  'User',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logradouro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'user',
    timestamps: true,
  }
);
