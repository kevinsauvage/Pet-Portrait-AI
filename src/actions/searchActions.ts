'use server';

import { redirect } from 'next/navigation';

import config from '@/core/config';

export const searchAction = async (searchQuery: string) => {
  redirect(`${config.routes.search}?searchQuery=${searchQuery}`);
};

