// Resend API utilities - all calls happen from browser
import type { ResendAccount, ResendContact, ResendTemplate } from './storage';

const RESEND_API_BASE = 'https://api.resend.com';

export interface Attachment {
  filename: string;
  content: string; // base64
  contentType?: string;
}

export interface SendEmailParams {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  attachments?: Attachment[];
}

export interface ApiError {
  message: string;
  name?: string;
}

async function makeRequest<T>(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const response = await fetch(`${RESEND_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: { message: data.message || 'An error occurred' } };
    }

    return { data: data as T };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Network error' } };
  }
}

export async function validateApiKey(apiKey: string): Promise<{ data?: ResendAccount; error?: ApiError }> {
  return makeRequest<ResendAccount>('/me', apiKey);
}

export async function sendEmail(
  apiKey: string,
  params: SendEmailParams
): Promise<{ data?: { id: string }; error?: ApiError }> {
  return makeRequest<{ id: string }>('/emails', apiKey, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getContacts(
  apiKey: string,
  audienceId?: string
): Promise<{ data?: { data: ResendContact[] }; error?: ApiError }> {
  const endpoint = audienceId ? `/audiences/${audienceId}/contacts` : '/contacts';
  return makeRequest<{ data: ResendContact[] }>(endpoint, apiKey);
}

export async function getTemplates(
  apiKey: string
): Promise<{ data?: { data: ResendTemplate[] }; error?: ApiError }> {
  return makeRequest<{ data: ResendTemplate[] }>('/templates', apiKey);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmails(emails: string[]): boolean {
  return emails.every(email => validateEmail(email));
}
