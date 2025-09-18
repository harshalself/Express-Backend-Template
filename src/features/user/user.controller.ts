import { Request, Response } from 'express';
import { CreateUser, UpdateUser, Login } from './user.validation';
import { RequestWithUser } from '../../interfaces/auth.interface';
import UserService from './user.service';
import HttpException from '../../utils/HttpException';
import { ResponseFormatter } from '../../utils/responseFormatter';
import { asyncHandler, parseIdParam, getUserId } from '../../utils/controllerHelpers';
import { removePassword, removePasswords } from '../../utils/dataSanitizer';

class UserController {
  public userService = new UserService();

  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUser = req.body;
    const user = await this.userService.register(userData);
    const userResponse = removePassword(user);

    ResponseFormatter.created(res, userResponse, 'User registered successfully');
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password }: Login = req.body;

    if (!email || !password) {
      throw new HttpException(400, 'Please provide both email and password');
    }

    const user = await this.userService.login(email, password);
    const userResponse = removePassword(user);

    ResponseFormatter.success(res, userResponse, 'Login successful');
  });

  public getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const users = await this.userService.getAllUsers();
    const usersResponse = removePasswords(users);

    ResponseFormatter.success(res, usersResponse, 'Users retrieved successfully');
  });

  public getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseIdParam(req);
    const user = await this.userService.getUserById(id);
    const userResponse = removePassword(user);

    ResponseFormatter.success(res, userResponse, 'User retrieved successfully');
  });

  public updateUser = asyncHandler(async (req: RequestWithUser, res: Response): Promise<void> => {
    const id = parseIdParam(req);
    const updateData: UpdateUser = req.body;
    const userId = getUserId(req);

    const user = await this.userService.updateUser(id, updateData, userId);
    const userResponse = removePassword(user);

    ResponseFormatter.success(res, userResponse, 'User updated successfully');
  });

  public deleteUser = asyncHandler(async (req: RequestWithUser, res: Response): Promise<void> => {
    const id = parseIdParam(req);
    const userId = getUserId(req);

    await this.userService.deleteUser(id, userId);

    ResponseFormatter.success(res, null, 'User deleted successfully');
  });
}

export default UserController;
