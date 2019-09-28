import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionControlller from './app/controllers/SessionControlller';
import authMiddleare from './app/middleware/auth';
import FileController from './app/controllers/FileController';
import EventController from './app/controllers/EventController';
import SignupController from './app/controllers/SignupController';
import OrganizerController from './app/controllers/OrganizerController';

const routes = new Router();
const upload = multer(multerConfig);

//  #Aplicacao (Nao autenticado)
routes.post('/sessions', SessionControlller.store);
routes.post('/users', UserController.store);

routes.use(authMiddleare);
routes.put('/users', UserController.update);

// #Do Arquivo
routes.post('/files', upload.single('file'), FileController.store);

// #Do Evento
routes.get('/events', EventController.index);
routes.post('/events', EventController.store);
routes.put('/events/:eventId', EventController.update);
routes.delete('/events/:eventId', EventController.delete);

// #Do Organizador
routes.get('/organizzer', OrganizerController.index);

// #Inscricoes
routes.post('/signup/:eventId/signup', SignupController.store);

// #teste

export default routes;
