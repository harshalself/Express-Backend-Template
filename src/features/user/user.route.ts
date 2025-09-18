import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import UserController from './user.controller';
import { createUserSchema, updateUserSchema, loginSchema } from './user.validation';

class UserRoute implements Route {
  public path = '/users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(createUserSchema),
      this.userController.register
    );

    this.router.post(
      `${this.path}/login`,
      validationMiddleware(loginSchema),
      this.userController.login
    );

    this.router.get(`${this.path}`, this.userController.getAllUsers);

    this.router.get(`${this.path}/:id`, this.userController.getUserById);

    this.router.put(
      `${this.path}/:id`,
      validationMiddleware(updateUserSchema),
      this.userController.updateUser
    );

    this.router.delete(`${this.path}/:id`, this.userController.deleteUser);
  }
}

export default UserRoute;
