import fs from 'fs';
import path from 'path';

// Shared storage for authentication data with file persistence for development
// In production, replace with Redis, database, or other persistent storage

const STORAGE_DIR = path.join(process.cwd(), '.tmp');
const TOTP_FILE = path.join(STORAGE_DIR, 'totp-store.json');
const OTP_FILE = path.join(STORAGE_DIR, 'otp-store.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Load data from file or create new Map
function loadTotpStore(): Map<string, { secret: string; verified: boolean }> {
  try {
    if (fs.existsSync(TOTP_FILE)) {
      const data = fs.readFileSync(TOTP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      console.log('📁 Loaded TOTP store from file:', Object.keys(parsed).length, 'entries');
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.error('Error loading TOTP store:', error);
  }
  console.log('🆕 Created new TOTP store');
  return new Map();
}

function loadOtpStore(): Map<string, { code: string; expires: number }> {
  try {
    if (fs.existsSync(OTP_FILE)) {
      const data = fs.readFileSync(OTP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Filter out expired OTPs
      const filtered = Object.entries(parsed).filter(([_, value]: any) => Date.now() <= value.expires);
      console.log('📁 Loaded OTP store from file:', filtered.length, 'valid entries');
      return new Map(filtered);
    }
  } catch (error) {
    console.error('Error loading OTP store:', error);
  }
  console.log('🆕 Created new OTP store');
  return new Map();
}

// Save data to file
function saveTotpStore(store: Map<string, { secret: string; verified: boolean }>) {
  try {
    const data = Object.fromEntries(store);
    fs.writeFileSync(TOTP_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Saved TOTP store to file:', store.size, 'entries');
  } catch (error) {
    console.error('Error saving TOTP store:', error);
  }
}

function saveOtpStore(store: Map<string, { code: string; expires: number }>) {
  try {
    const data = Object.fromEntries(store);
    fs.writeFileSync(OTP_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Saved OTP store to file:', store.size, 'entries');
  } catch (error) {
    console.error('Error saving OTP store:', error);
  }
}

// TOTP secrets storage with persistence
export const totpStore = loadTotpStore();

// SMS OTP storage with persistence
export const otpStore = loadOtpStore();

// Wrapper functions to save after modifications
export function setTotpData(key: string, value: { secret: string; verified: boolean }) {
  totpStore.set(key, value);
  saveTotpStore(totpStore);
}

export function deleteTotpData(key: string) {
  totpStore.delete(key);
  saveTotpStore(totpStore);
}

export function setOtpData(key: string, value: { code: string; expires: number }) {
  otpStore.set(key, value);
  saveOtpStore(otpStore);
}

export function deleteOtpData(key: string) {
  otpStore.delete(key);
  saveOtpStore(otpStore);
}

// Utility functions for identifier normalization
export function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

export function isValidEmail(identifier: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(identifier);
}

export function isValidPhone(identifier: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(identifier);
}

// Helper to validate identifier format
export function validateIdentifier(identifier: string): { isValid: boolean; type: 'email' | 'phone' | 'unknown' } {
  const normalized = normalizeIdentifier(identifier);
  
  if (isValidEmail(normalized)) {
    return { isValid: true, type: 'email' };
  }
  
  if (isValidPhone(normalized)) {
    return { isValid: true, type: 'phone' };
  }
  
  return { isValid: false, type: 'unknown' };
}