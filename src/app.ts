import express, { ErrorRequestHandler, Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import { MulterError } from 'multer';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = ({ err, req, res, next }) => {
  if (err instanceof MulterError) {
    res.json({ error: 'Ocorreu um erro' });
  }

  if (err.status) {
    res.status(err.status);
  } else {
    res.status(400);
  }

  if (err.message) {
    res.json({ error: err.message });
  } else {
    res.json({ error: 'Ocorreu um erro.' });
  }
};

const server = express();
server.use(cors());
server.use(express.static(path.join(__dirname, '../public')));
server.use('/images', express.static(path.resolve(__dirname, 'public', 'images')));
server.use(express.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use(routes);

server.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'endpoint not found' });
});
server.use(errorHandler);

export default server;
