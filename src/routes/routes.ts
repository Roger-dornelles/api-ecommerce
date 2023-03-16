import { privateRoute } from './../auth/auth';
import { Router, Request, Response } from 'express';
import * as userController from '@/controllers/userController';
import * as statesController from '@/controllers/statesController';
import * as productController from '@/controllers/productController';
import { uploadImages } from '@/middlewares/uploadImages';

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
route.put('/user/:id', privateRoute, userController.updateUser);
route.delete('/user/:id', privateRoute, userController.deleteUser);
route.get('/user/info/:id', privateRoute, userController.userInfo);

route.post('/user/new/product/:id', privateRoute, uploadImages.array('photos', 10), productController.newProduct);
route.put('/product/update/:id', privateRoute, productController.updateProductInformation);

export default route;
