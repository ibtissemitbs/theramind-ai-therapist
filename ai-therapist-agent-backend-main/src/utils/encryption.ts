import crypto from 'crypto';
import { logger } from './logger';

// Clé de chiffrement (doit être dans .env en production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Génère une clé de chiffrement sécurisée
 * À exécuter une seule fois pour générer la clé à mettre dans .env
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Chiffre un texte en utilisant AES-256-GCM
 * @param text - Le texte à chiffrer
 * @returns Le texte chiffré au format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  try {
    // Générer un vecteur d'initialisation aléatoire
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Créer le cipher
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Chiffrer le texte
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obtenir le tag d'authentification
    const authTag = cipher.getAuthTag();
    
    // Retourner: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Déchiffre un texte chiffré avec AES-256-GCM
 * @param encryptedText - Le texte chiffré au format: iv:authTag:encryptedData
 * @returns Le texte déchiffré
 */
export function decrypt(encryptedText: string): string {
  try {
    // Séparer les composants
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Créer le decipher
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // Définir le tag d'authentification
    decipher.setAuthTag(authTag);
    
    // Déchiffrer
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Vérifie si un texte est chiffré
 * @param text - Le texte à vérifier
 * @returns true si le texte semble chiffré
 */
export function isEncrypted(text: string): boolean {
  const parts = text.split(':');
  return parts.length === 3 && 
         parts[0].length === IV_LENGTH * 2 && 
         parts[1].length === AUTH_TAG_LENGTH * 2;
}

/**
 * Chiffre un objet en JSON
 * @param obj - L'objet à chiffrer
 * @returns L'objet chiffré en string
 */
export function encryptObject(obj: any): string {
  const jsonString = JSON.stringify(obj);
  return encrypt(jsonString);
}

/**
 * Déchiffre un JSON chiffré
 * @param encryptedJson - Le JSON chiffré
 * @returns L'objet déchiffré
 */
export function decryptObject(encryptedJson: string): any {
  const decrypted = decrypt(encryptedJson);
  return JSON.parse(decrypted);
}

// Log warning if using default key (development only)
if (!process.env.ENCRYPTION_KEY) {
  logger.warn('⚠️  Using default encryption key. Set ENCRYPTION_KEY in .env for production!');
  logger.info(`💡 Generated key for .env: ENCRYPTION_KEY=${generateEncryptionKey()}`);
}
