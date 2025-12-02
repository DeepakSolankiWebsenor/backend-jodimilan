import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { config } from '../config/app';

export class EncryptionService {
  private static algorithm = 'aes-256-cbc';

  // Convert key & iv from HEX → Buffer (correct format)
  private static key = Buffer.from(config.encryption.key, "hex"); // 64 char hex → 32 bytes
  private static iv = Buffer.from(config.encryption.iv, "hex");   // 32 char hex → 16 bytes

  /**
   * Encrypt (Laravel backend compatible)
   */
  static encrypt(data: any): string {
    try {
      const text = typeof data === "string" ? data : JSON.stringify(data);

      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.key,
        this.iv
      );

      let encrypted = cipher.update(text, "utf8", "base64");
      encrypted += cipher.final("base64");

      return encrypted;
    } catch (error) {
      console.error(
        `❌ Encryption failed → KEY:${this.key.length} bytes, IV:${this.iv.length} bytes`,
        error
      );
      return "";   // prevent API 500 crash
    }
  }

  /**
   * Decrypt (Laravel backend compatible)
   */
  static decrypt(encryptedData: string): any {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        this.iv
      );

      let decrypted = decipher.update(encryptedData, "base64", "utf8");
      decrypted += decipher.final("utf8");

      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error("❌ Decryption failed", error);
      return null;
    }
  }

  /**
   * Encrypt for CryptoJS (Frontend JS/React support)
   */
  static cryptoJsEncrypt(data: any): string {
    try {
      const text = typeof data === "string" ? data : JSON.stringify(data);
      return CryptoJS.AES.encrypt(text, config.encryption.key).toString();
    } catch (error) {
      console.error("❌ Front-end encryption failed", error);
      return "";
    }
  }

  /**
   * Decrypt from CryptoJS (Frontend JS/React)
   */
  static cryptoJsDecrypt(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        config.encryption.key
      );
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error("❌ Front-end decryption failed", error);
      return null;
    }
  }
}
