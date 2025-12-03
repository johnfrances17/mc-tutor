import crypto from 'crypto';

/**
 * Chat Encryption Service
 * Provides AES-256-GCM encryption for secure message storage
 * Port of PHP ChatEncryption class
 */
export class EncryptionService {
  private encryptionKey: Buffer;
  private cipherMethod = 'aes-256-gcm';

  constructor() {
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    
    // Decode base64 key
    this.encryptionKey = Buffer.from(keyString, 'base64');
    
    if (this.encryptionKey.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (256 bits) when decoded');
    }
  }

  /**
   * Encrypt a message
   * @param message The plaintext message
   * @returns The encrypted message with IV and tag, or null on failure
   */
  encrypt(message: string): string | null {
    if (!message) {
      return null;
    }

    try {
      // Generate random IV
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.cipherMethod, this.encryptionKey, iv) as crypto.CipherGCM;
      
      // Encrypt message
      let encrypted = cipher.update(message, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine IV + encrypted data + tag and encode
      const result = Buffer.concat([iv, encrypted, tag]);
      return result.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt a message
   * @param encryptedMessage The encrypted message
   * @returns The decrypted message, or null on failure
   */
  decrypt(encryptedMessage: string): string | null {
    if (!encryptedMessage) {
      return null;
    }

    try {
      // Decode from base64
      const data = Buffer.from(encryptedMessage, 'base64');
      
      const ivLength = 16;
      const tagLength = 16;
      
      // Extract IV, encrypted data, and tag
      const iv = data.subarray(0, ivLength);
      const tag = data.subarray(data.length - tagLength);
      const encrypted = data.subarray(ivLength, data.length - tagLength);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.cipherMethod, this.encryptionKey, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(tag);
      
      // Decrypt message
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Hash a message for verification (one-way)
   * @param message The message to hash
   * @returns The hash
   */
  hashMessage(message: string): string {
    return crypto
      .createHmac('sha256', this.encryptionKey)
      .update(message)
      .digest('hex');
  }

  /**
   * Verify message integrity
   * @param message The original message
   * @param hash The hash to verify against
   * @returns True if valid
   */
  verifyHash(message: string, hash: string): boolean {
    const computedHash = this.hashMessage(message);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  }

  /**
   * Generate a new encryption key
   * @returns Base64-encoded 256-bit key
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('base64');
  }
}

// Singleton instance
let encryptionInstance: EncryptionService | null = null;

/**
 * Get encryption service instance
 */
export const getEncryptionService = (): EncryptionService => {
  if (!encryptionInstance) {
    encryptionInstance = new EncryptionService();
  }
  return encryptionInstance;
};

/**
 * Quick encrypt function
 */
export const encryptMessage = (message: string): string | null => {
  return getEncryptionService().encrypt(message);
};

/**
 * Quick decrypt function
 */
export const decryptMessage = (encryptedMessage: string): string | null => {
  return getEncryptionService().decrypt(encryptedMessage);
};
