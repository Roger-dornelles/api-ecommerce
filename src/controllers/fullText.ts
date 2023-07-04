import { Request, Response } from 'express';
import Product from '@/models/Product';
import { Op } from 'sequelize';

export const fullTextSearch = async (req: Request, res: Response) => {
  try {
    const { text } = req.params;

    if (text.length < 3) {
      return res.status(200).json([]);
    }

    if (text.length >= 3) {
      const productSearch = await Product.findAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${text}%`,
              },
            },
            {
              description: {
                [Op.like]: `%${text}%`,
              },
            },
          ],
        },
      });

      return res.status(201).json({
        error: false,
        message: null,
        data: productSearch,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro, tente mais tarde',
      data: null,
    });
  }
};
