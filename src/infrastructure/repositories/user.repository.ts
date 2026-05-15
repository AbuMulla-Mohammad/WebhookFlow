import { and, eq } from "drizzle-orm";
import { User } from "../../domain/entities/user.js";
import { db } from "../database/connection.js";
import { users, UserRow } from "../database/schema.js";
import { UserRole } from "../../domain/types/user-roles.js";
import { UserRepository } from "../../domain/repositories/user.repository.js";

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly database: typeof db) {}

  private toDomain(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as UserRole,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isDeleted: row.isDeleted,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.database.query.users.findFirst({
      where: and(eq(users.email, email), eq(users.isDeleted, false)),
    });
    return result ? this.toDomain(result) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.database.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.isDeleted, false)),
    });
    return result ? this.toDomain(result) : null;
  }

  async save(user: User): Promise<User> {
    const [result] = await this.database
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isDeleted: user.isDeleted,
      })
      .returning();
    return this.toDomain(result);
  }
}
