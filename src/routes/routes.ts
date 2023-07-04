import { privateRoute } from './../auth/auth';
import { Router, Request, Response } from 'express';
import * as userController from '@/controllers/userController';
import * as statesController from '@/controllers/statesController';
import * as productController from '@/controllers/productController';
import * as imageController from '@/controllers/imageController';
import { uploadImages } from '@/middlewares/uploadImages';
import * as fullText from '@/controllers/fullText';

const route = Router();

route.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    error: false,
    message: 'rota teste',
    data: null,
  });
});

// add states
route.post('/add/states', privateRoute, statesController.addState);

// get all states
route.get('/states/all', statesController.getAllStates);

// remove one image
route.delete('/product/image/:imageID/:userID', privateRoute, imageController.deleteOneImage);

route.post('/create/user', userController.createUser);
route.post('/login', userController.login);
route.put('/user/:id', privateRoute, userController.updateUser);
route.delete('/user/:id', privateRoute, userController.deleteUser);
route.get('/user/info/:id', privateRoute, userController.userInfo);

route.post('/user/new/product/:id', privateRoute, uploadImages.array('photos', 10), productController.newProduct);
route.put('/product/update/:id', privateRoute, productController.updateProductInformation);
route.delete('/product/:id', privateRoute, productController.deleteOneProduct);
route.get('/product/:id', productController.viewOneProduct);
route.get('/products/all', productController.displayAllProducts);

// search product custom (FullText)
route.get('/fulltext/:text', fullText.fullTextSearch);

route.post('/product/purchase/:id', privateRoute, productController.purchases);
route.get('/product/purchase/:id', privateRoute, productController.userPurchases);

route.post('/installment', privateRoute, productController.installments);

export default route;
