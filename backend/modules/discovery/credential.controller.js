import prisma from '../../config/prisma.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Ensure the key is exactly 32 bytes for aes-256-cbc.
// If it's a string, we take the first 32 chars or pad it.
const rawKey = process.env.MASTER_ENCRYPTION_KEY || 'default-secret-key-that-is-32bytes';
const ENCRYPTION_KEY = Buffer.from(rawKey.padEnd(32, '0').slice(0, 32));
const IV_LENGTH = 16; 

export function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  if (!text) return text;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export const createCredential = async (req, res) => {
  try {
    const { credentialName, credentialType, username, passwordValue, domainIpAddress } = req.body;
    
    if (!passwordValue) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const newCred = await prisma.discoveryCredential.create({
      data: {
        credentialName,
        credentialType,
        username,
        passwordValue: encrypt(passwordValue),
        domainIpAddress
      }
    });

    // Do not return the password hash to the frontend
    res.status(201).json({ 
      id: newCred.id, 
      credentialName: newCred.credentialName, 
      credentialType: newCred.credentialType 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCredentials = async (req, res) => {
  try {
    // Only fetch non-sensitive fields
    const creds = await prisma.discoveryCredential.findMany({
      select: { 
        id: true, 
        credentialName: true, 
        credentialType: true, 
        username: true, 
        domainIpAddress: true, 
        createdAt: true 
      }
    });
    res.status(200).json(creds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.discoveryCredential.delete({ where: { id } });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
