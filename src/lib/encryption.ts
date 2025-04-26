import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY || '', 'base64');

function ensureValidKey(): void {
  if (KEY.length !== 32) {
    throw new Error('Invalid encryption key length. Must be 32 bytes when decoded from base64.');
  }
}

export function encrypt(text: string): string {
  try {
    if (!text) return text;
    ensureValidKey();

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

export function decrypt(text: string): string {
  try {
    if (!text || !text.includes(':')) return text;
    ensureValidKey();

    const [ivHex, encryptedHex] = text.split(':');
    if (!ivHex || !encryptedHex) return text;

    try {
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (decryptError) {
      console.error('Failed to decrypt:', decryptError);
      return text;
    }
  } catch (error) {
    console.error('Decryption setup error:', error);
    return text;
  }
}
