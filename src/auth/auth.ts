import JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface TokenInterface {
  email: string;
  name: string;
  id: number;
}

export const privateRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token invalido');
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET as string);

    if (decoded) {
      Object(req).user = decoded;
      next();
    } else {
      res.status(401).json({
        error: true,
        message: 'Não autorizado.',
        data: null,
      });
    }
  } catch (err) {
    res.status(401).json({
      error: true,
      message: 'Usuário não autenticado.',
      data: null,
    });
  }
};
