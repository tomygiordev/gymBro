import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { usersTable, User } from '../../../../database/schema';
import { PasswordService } from '../services/password.service';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance,
    private readonly passwordService: PasswordService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);
    return result[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return result[0] || null;
  }

  async create(data: {
    email: string;
    password: string;
  }): Promise<User> {
    const passwordHash = await this.passwordService.hash(data.password);
    const now = new Date().toISOString();
    const result = await this.db
      .insert(usersTable)
      .values({
        email: data.email.toLowerCase(),
        passwordHash,
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();
    return result[0];
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hash = await this.passwordService.hash(newPassword);
    await this.db
      .update(usersTable)
      .set({ passwordHash: hash, updatedAt: new Date().toISOString() } as any)
      .where(eq(usersTable.id, userId));
  }

  async delete(userId: string): Promise<void> {
    await this.db
      .update(usersTable)
      .set({ deletedAt: new Date().toISOString(), isActive: 0 } as any)
      .where(eq(usersTable.id, userId));
  }
}