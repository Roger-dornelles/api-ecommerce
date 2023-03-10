import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/instances/mysql';

export interface CreateUStatesInstance extends Model {
  id: number;
  name: string;
}

export const States = sequelize.define<CreateUStatesInstance>(
  'States',
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
  },
  {
    tableName: 'states',
    timestamps: false,
  }
);
