import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return hash(password, 10);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return compare(password, hash);
    } catch {
      return false;
    }
  }
}