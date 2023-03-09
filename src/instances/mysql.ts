import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
export const sequelize = new Sequelize(
  process.env.DB_DATABASE as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,

  {
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT as string),
  }
);

export const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database: ', error);
  }
};
connection();
