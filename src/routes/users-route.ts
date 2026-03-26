import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";
import { jwt } from "@elysiajs/jwt";

export const usersRoute = new Elysia({ prefix: "/api" })
  .use(
    jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET || 'supersecret'
    })
  )
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
  .post("/login", async ({ body, set, jwt }) => {
    try {
      const user = await usersService.loginUser(body);
      const token = await jwt.sign({ id: user.id });
      return {
        message: "User logged in successfully",
        data: {
          ...user,
          token,
        },
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
    beforeHandle: async ({ jwt, set, headers: { authorization } }) => {
        if (!authorization) {
            set.status = 401;
            return { message: "Unauthorized: No token provided" };
        }
        const token = authorization.split(' ')[1];
        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = 401;
            return { message: "Unauthorized: Invalid token" };
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
