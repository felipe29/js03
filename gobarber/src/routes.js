import { Router } from 'express';

import multer from 'multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';
import FileController from './app/controllers/FileController';
import providerController from './app/controllers/ProviderController';
import appointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);
routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.get('/providers', providerController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.post('/appointments', appointmentController.store);
routes.get('/appointments', appointmentController.index);
routes.delete('/appointments/:id', appointmentController.delete);
routes.get('/schedule', ScheduleController.index);
routes.post('/files', upload.single('file'), FileController.store);
routes.get('/notification', NotificationController.index);
routes.put('/notification/:id', NotificationController.update);
export default routes;
