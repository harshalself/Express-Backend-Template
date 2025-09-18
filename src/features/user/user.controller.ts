import { NextFunction, Request, Response } from "express";
import { CreateUser, UpdateUser, Login } from "./user.validation";
import { RequestWithUser } from "../../interfaces/auth.interface";
import UserService from "./user.service";
import HttpException from "../../utils/HttpException";

class UserController {
  public userService = new UserService();

  public register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: CreateUser = req.body;
      const user = await this.userService.register(userData);

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      res.status(201).json({
        data: userResponse,
        message: "User registered successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password }: Login = req.body;

      if (!email || !password) {
        throw new HttpException(400, "Please provide both email and password");
      }

      const user = await this.userService.login(email, password);

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      res.status(200).json({
        data: userResponse,
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();

      // Remove passwords from response
      const usersResponse = users.map((user) => {
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return userWithoutPassword;
      });

      res.status(200).json({
        data: usersResponse,
        message: "Users retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        throw new HttpException(400, "Invalid user ID");
      }

      const user = await this.userService.getUserById(id);

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      res.status(200).json({
        data: userResponse,
        message: "User retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData: UpdateUser = req.body;

      if (isNaN(id)) {
        throw new HttpException(400, "Invalid user ID");
      }

      // Get the user making the update (from auth middleware)
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      const user = await this.userService.updateUser(id, updateData, userId);

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      res.status(200).json({
        data: userResponse,
        message: "User updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        throw new HttpException(400, "Invalid user ID");
      }

      // Get the user making the deletion (from auth middleware)
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      await this.userService.deleteUser(id, userId);

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
