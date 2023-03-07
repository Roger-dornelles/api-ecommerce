import { Router, Request, Response } from 'express';

const route = Router();

route.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    error: false,
    message: 'rota teste',
    data: null,
  });
});

export default route;
