import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

export const usersService = {
  async registerUser({ name, email, password }: any) {
    // 1. Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error("Email already registered");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user
    const [result] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Return user data (excluding password)
    const newUser = await db.select().from(users).where(eq(users.id, result.insertId)).limit(1);
    if (!newUser[0]) {
      throw new Error("Failed to retrieve created user");
    }
    const { password: _, ...userWithoutPassword } = newUser[0];
    return userWithoutPassword;
  },

  async loginUser({ email, password }: any) {
    // 1. Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // 3. Create Session
    const sessionToken = randomUUID();
    await db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
    });

    // 4. Return user data (excluding password) + Session Token
    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      token: sessionToken,
    };
  },

  async checkSession(token: string) {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    return session || null;
  },

  async getAllUsers() {
    // 1. Fetch all users
    const allUsers = await db.select().from(users);

    // 2. Remove passwords
    return allUsers.map(({ password: _, ...user }) => user);
  },

  async getUserById(userId: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async logoutUser(token: string) {
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }
    await db.delete(sessions).where(eq(sessions.token, token));
    return "User logged out successfully";
  },
};
