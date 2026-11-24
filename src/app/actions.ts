'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidatePortfolio() {
  revalidateTag('portfolio');
  revalidatePath('/', 'layout');
  revalidatePath('/');
}
