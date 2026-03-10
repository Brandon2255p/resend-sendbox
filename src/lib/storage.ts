// Storage utility for managing localStorage operations
// All data stays in the browser for security

const STORAGE_KEYS = {
  API_KEY: 'resend_api_key',
  ACCOUNT: 'resend_account',
  CONTACTS: 'resend_contacts',
  TEMPLATES: 'resend_templates',
} as const;

export interface ResendAccount {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface ResendContact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export interface ResendTemplate {
  id: string;
  name: string;
  subject: string | null;
  html: string | null;
  created_at: string;
}

export interface ResendDomain {
  id: string;
  name: string;
  created_at: string;
  region: string;
  status: 'pending' | 'verified' | 'failed';
}

export interface SenderSettings {
  name: string;
  domain: string;
}

const SENDER_SETTINGS_KEY = 'resend_sender_settings';

export function getSenderSettings(): SenderSettings | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(SENDER_SETTINGS_KEY);
  return data ? JSON.parse(data) : null;
}

export function setSenderSettings(settings: SenderSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SENDER_SETTINGS_KEY, JSON.stringify(settings));
}

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.API_KEY);
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
}

export function getAccount(): ResendAccount | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
  return data ? JSON.parse(data) : null;
}

export function setAccount(account: ResendAccount): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(account));
}

export function getContacts(): ResendContact[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  return data ? JSON.parse(data) : [];
}

export function setContacts(contacts: ResendContact[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

export function getTemplates(): ResendTemplate[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  return data ? JSON.parse(data) : [];
}

export function setTemplates(templates: ResendTemplate[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
