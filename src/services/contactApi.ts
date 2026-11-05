import { GRAPHQL_URL } from '@/services/backend';
import { getAccessToken } from '@/services/authToken';

const CONTACT_API = `${new URL(GRAPHQL_URL).origin}/api/contact/messages`;

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessagePage {
  nodes: ContactMessage[];
  totalCount: number;
}

function authHeaders(json = false): HeadersInit {
  const token = getAccessToken();
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const response = await fetch(CONTACT_API, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Contact message submission failed');
}

export async function fetchContactMessages(input: {
  take: number;
  skip: number;
  status?: ContactMessage['status'];
}): Promise<ContactMessagePage> {
  const params = new URLSearchParams({ take: String(input.take), skip: String(input.skip) });
  if (input.status) params.set('status', input.status);
  const response = await fetch(`${CONTACT_API}?${params}`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Contact messages could not be loaded');
  return (await response.json()) as ContactMessagePage;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status'],
): Promise<void> {
  const response = await fetch(`${CONTACT_API}/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Contact message status could not be updated');
}
