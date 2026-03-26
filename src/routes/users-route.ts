import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";
import { UnauthorizedError } from "../errors";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post("/register", async ({ body, set }) => {
    try {
      const user = await usersService.registerUser(body);
      return {
        message: "User created successfully",
        data: user,
      };
    } catch (error: any) {
      set.status = 400;
      return { message: error.message };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    })
  })
  .post("/login", async ({ body, set }) => {
    try {
      const userWithToken = await usersService.loginUser(body);
      return {
        message: "User logged in successfully",
        data: userWithToken,
      };
    } catch (error: any) {
      set.status = 401;
      return { message: error.message };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  .derive(async ({ headers: { authorization } }) => {
    if (!authorization) return { session: null };
    const token = authorization.split(' ')[1];
    if (!token) return { session: null };
    
    const session = await usersService.checkSession(token);
    return { session };
  })
  .get("/users/me", async ({ session, set }) => {
      if (!session) {
          set.status = 401;
          return { message: "Unauthorized: No token provided" };
      }
      const user = await usersService.getUserById(session.userId);
      return {
        message: "User fetched successfully",
        data: user,
      };
  })
  .get("/users", async ({ session, set }) => {
      if (!session) {
          set.status = 401;
          return { message: "Unauthorized: No token provided" };
      }
      const users = await usersService.getAllUsers();
      return {
        message: "Users fetched successfully",
        data: users,
      };
  })
  .get("/logout", async ({ headers: { authorization }, set }) => {
    try {
      const token = authorization?.split(' ')[1];
      if (!token) {
        set.status = 401;
        return { message: "Unauthorized: No token provided" };
      }
      const message = await usersService.logoutUser(token);
      return { message };
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        set.status = 401;
      } else {
        set.status = 500;
      }
      return { message: error.message };
    }
  });
