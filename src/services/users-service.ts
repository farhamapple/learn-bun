import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

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

    // 3. Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async getAllUsers() {
    // 1. Fetch all users
    const allUsers = await db.select().from(users);

    // 2. Remove passwords
    return allUsers.map(({ password, ...user }) => user);
  },
};
