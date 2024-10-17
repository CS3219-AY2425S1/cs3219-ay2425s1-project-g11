'use server';

import { cookies } from 'next/headers';

export async function login(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  cookies().set('access-token', token);
  return true;
}

export async function logout(): Promise<boolean> {
  cookies().delete('access-token');
  return true;
}

export async function getCookieServerSide() {
  return cookies().get('access-token');
}
