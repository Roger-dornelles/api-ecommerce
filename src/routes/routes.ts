import { privateRoute } from './../auth/auth';
import { Router, Request, Response } from 'express';
import * as userController from '@/controllers/userController';
import * as statesController from '@/controllers/statesController';
const route = Router();

route.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    error: false,
    message: 'rota teste',
    data: null,
  });
});

// list states
route.post('/add/states', privateRoute, statesController.addState);

route.post('/create/user', userController.createUser);
route.post('/login', userController.login);
route.put('/user/:id',privateRoute,userController.updateUser)

export default route;
