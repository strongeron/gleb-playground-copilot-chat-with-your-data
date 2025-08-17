// Authentication utilities for password protection
export const AUTH_CONFIG = {
  username: process.env.BASIC_AUTH_USERNAME || 'admin',
  password: process.env.BASIC_AUTH_PASSWORD || 'your-secure-password-here',
  realm: 'Secure Trace Analysis Area'
}

export const validateCredentials = (username: string, password: string): boolean => {
  return username === AUTH_CONFIG.username && password === AUTH_CONFIG.password
}

export const generateAuthHeader = (username: string, password: string): string => {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64')
  return `Basic ${credentials}`
}
