import JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface TokenInterface {
  email: string;
  name: string;
  id: number;
}

export const privateRoute = async (req: Request, res: Response, next: NextFunction) => {
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

export const userAuthenticated = async (
  req: Request,
  userId: number | string
): Promise<{ error: boolean; message: string; data: null } | undefined> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = JWT.verify(token as string, process.env.JWT_SECRET as string);

    if (Object(decoded).id !== Number(userId)) {
      return {
        error: true,
        message: 'Usuário não autorizado.',
        data: null,
      };
    }
  } catch (error) {
    return {
      error: true,
      message: 'Usuário não autenticado.',
      data: null,
    };
  }
};

export const authenticateAppUser = async (req: Request, res: Response) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(404).json({
        error: true,
        message: 'Token invalido',
        data: null,
      });
    }
    const decoded = JWT.verify(token as string, process.env.JWT_SECRET as string);

    if (decoded) {
      return res.status(201).json({
        error: false,
        message: null,
        data: decoded,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Ocorreu um erro',
      data: null,
    });
  }
};
