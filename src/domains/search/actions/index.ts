'use server';

import { redirect } from 'next/navigation';

import config from '@/core/config';

export async function searchAction(searchQuery: string) {
  redirect(`${config.routes.search}?searchQuery=${searchQuery}`);
}
