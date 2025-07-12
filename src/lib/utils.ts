import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment validation utility
export function validateEnvVars(required: string[], optional: string[] = []) {
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  const present = [...required, ...optional].filter(key => process.env[key]);
  console.log('Environment variables loaded:', present.map(key => `${key}: ***`));
  
  return true;
}
