import fs from 'node:fs/promises';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

export default async function readData<T>(strapi: Core.Strapi, file: string): Promise<T[]> {
  const raw = await fs.readFile(path.join(strapi.dirs.app.root, 'data', file), 'utf8');
  return JSON.parse(raw);
}