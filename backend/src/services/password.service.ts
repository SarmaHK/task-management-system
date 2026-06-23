import bcrypt from 'bcryptjs';

export class PasswordService {
  /**
   * Generates a strong temporary password containing alphanumeric characters and special symbols.
   * Format: @Temp[Random8Chars]123
   */
  public static generateTemporaryPassword(): string {
    const randAlphaNum = Math.random().toString(36).substring(2, 10);
    return `@Temp${randAlphaNum}123`;
  }

  /**
   * Hashes a plain text password using bcrypt.
   * @param password The plain text password
   * @returns The hashed password
   */
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compares a plain text password with a hash.
   * @param password The plain text password
   * @param hash The hashed password
   * @returns True if they match, false otherwise
   */
  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
