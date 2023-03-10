import { Router, Request, Response } from 'express';
import * as userController from '@/controllers/userController';
const route = Router();

route.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    error: false,
    message: 'rota teste',
    data: null,
  });
});

route.post('/create/user', userController.createUser);
route.post('/login', userController.login)

export default route;
