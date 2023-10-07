import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyErrorType } from './validator';
import { getInvalidQueryParamsResponse } from './response';
import { ZodError } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolvePathWithImportUrl(url: string, fragments: string[]) {
  const filePath = path.dirname(fileURLToPath(url));
  return path.resolve(filePath, ...fragments);
}

export function createInvalidPayloadResponse(error: ZodError) {
  const { body, query } = classifyErrorType(error);
  if (query) {
    return getInvalidQueryParamsResponse(query);
  }

  return getInvalidQueryParamsResponse(body!);
}
