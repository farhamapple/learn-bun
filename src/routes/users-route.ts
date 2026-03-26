import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";

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
  .guard({
    beforeHandle: async ({ set, headers: { authorization } }) => {
        if (!authorization) {
            set.status = 401;
            return { message: "Unauthorized: No token provided" };
        }
        const token = authorization.split(' ')[1];
        if (!token) {
            set.status = 401;
            return { message: "Unauthorized: Invalid token format" };
        }
        const session = await usersService.checkSession(token);
        if (!session) {
            set.status = 401;
            return { message: "Unauthorized: Invalid or expired session" };
        }
    }
  }, (app) =>
    app.get("/users", async () => {
        const users = await usersService.getAllUsers();
        return {
          message: "Users fetched successfully",
          data: users,
        };
    })
  );
