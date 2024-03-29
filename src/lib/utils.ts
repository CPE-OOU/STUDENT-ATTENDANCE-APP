import { TOKEN_EXPIRES_MIN, TOKEN_RESEND_MIN } from './constant';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyErrorType } from './validator';
import { getInvalidQueryParamsResponse } from './response';
import { ZodError } from 'zod';
import { AuthToken } from '@/config/db/schema';
import { addMinutes, differenceInMinutes, subMinutes } from 'date-fns';
import {
  SQL,
  sql,
  InferSelectModel,
  DrizzleTypeError,
  Table,
  Equal,
  Column,
  GetColumnData,
  ColumnBaseConfig,
  ColumnDataType,
  like,
  notLike,
  eq,
  not,
  desc,
  asc,
  AnyColumn,
} from 'drizzle-orm';
import { PgColumn, SelectedFields } from 'drizzle-orm/pg-core';

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

export function evaluateAuthToken(
  token: AuthToken,
  { currentIp }: { currentIp?: string | null }
) {
  let allowResend =
    Math.max(
      differenceInMinutes(
        token.createdAt!,
        addMinutes(new Date(), TOKEN_RESEND_MIN)
      ),
      0
    ) === 0;

  if (!allowResend) {
    allowResend = currentIp !== token.userIp;
  }

  return {
    expired: new Date(token.expiresIn).getTime() < Date.now(),
    allowResend,
  };
}

export function createClientAuthTokenInfo(token: AuthToken) {
  return {
    formFieldLength: token.token.length,
    retryAfter: addMinutes(
      new Date(token.createdAt!),
      TOKEN_RESEND_MIN
    ).toISOString(),
  };
}

interface RouteIsActiveProps {
  currentRoute: string;
  activeRoute: string;
}

const pathMatch = /^(?:https?:\/{2})?(?:www\.)?.*?\.[a-z]\w+\/(?<pathname>.*)/i;
const absolutePath = /^https?/;
const trailingLeadingPathMatch = /^\/|\/$/;
export function routeIsActive({
  activeRoute,
  currentRoute,
}: RouteIsActiveProps) {
  if (!(absolutePath.test(activeRoute) && absolutePath.test(currentRoute))) {
    const activePathname = <{ pathname?: string } | null>(
      pathMatch.exec(activeRoute)?.groups
    );

    const currentPathname = <{ pathname?: string } | null>(
      pathMatch.exec(currentRoute)?.groups
    );

    if (activePathname?.pathname) activeRoute = activePathname.pathname;
    if (currentPathname?.pathname) currentRoute = currentPathname.pathname;
  }

  activeRoute = activeRoute.replace(trailingLeadingPathMatch, '');
  currentRoute = currentRoute.replace(trailingLeadingPathMatch, '');
  return (
    activeRoute === currentRoute ||
    (activeRoute && currentRoute && activeRoute.startsWith(currentRoute))
  );
}

export type SelectResultField<
  T,
  TDeep extends boolean = true
> = T extends DrizzleTypeError<any>
  ? T
  : T extends Table
  ? Equal<TDeep, true> extends true
    ? SelectResultField<T['_']['columns'], false>
    : never
  : T extends Column<any>
  ? GetColumnData<T>
  : T extends SQL | SQL.Aliased
  ? T['_']['type']
  : T extends Record<string, any>
  ? SelectResultFields<T, true>
  : never;

type SelectResultFields<TSelectedFields, TDeep extends boolean = true> = {
  [Key in keyof TSelectedFields & string]: SelectResultField<
    TSelectedFields[Key],
    TDeep
  >;
} & {};

export function jsonAggBuildObject<T extends SelectedFields>(shape: T) {
  const chunks: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }
    chunks.push(sql.raw(`'${key}',`));
    chunks.push(sql`${value}`);
  });

  return sql<Array<SelectResultFields<T>>>`coalesce(
      json_agg(
        distinct jsonb_build_object(${sql.join(chunks)})
        ),'[]'::json)`;
}

export function jsonBuildObject<T extends SelectedFields>(shape: T) {
  const chunks: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }
    chunks.push(sql.raw(`'${key}',`));
    chunks.push(sql`${value}`);
  });

  return sql<SelectResultFields<T>>`json_build_object(${sql.join(chunks)})`;
}

export function getUrlQuery<Query extends Record<string, unknown>>(
  url: string
) {
  return Object.fromEntries(new URL(url).searchParams) as Query;
}

export function filterColumn({
  column,
  value,
}: {
  column: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>;
  value: string;
}) {
  const [filterValue, filterVariety] = value?.split('.') ?? [];

  switch (filterVariety) {
    case 'contains':
      return like(column, `%${filterValue}%`);
    case 'does not contain':
      return notLike(column, `%${filterValue}%`);
    case 'is':
      return eq(column, filterValue);
    case 'is not':
      return not(eq(column, filterValue));
    default:
      return like(column, `%${filterValue}%`);
  }
}

export const capitialize = (value: string) => {
  if (value === '') return '';
  return value[0].toUpperCase() + value.slice(1).toLowerCase();
};

export function resolveSortField<
  Select extends SelectedFields,
  Col extends PgColumn
>(selectFields: Select, Selectfallback: Col, sort?: [string, 'asc' | 'desc']) {
  let dbField = sort?.[0]
    ? selectFields[sort[0] as keyof Select] ?? Selectfallback
    : Selectfallback;

  const [field, orderType] = [dbField, sort?.[1] ?? 'desc'];

  return orderType === 'desc'
    ? desc(field as AnyColumn)
    : asc(field as AnyColumn);
}

export function decodeBase64ToFile(encode: string, fileName: string) {
  // const binaryData = window.atob(encode);
  const mimeType = encode.substring('data:'.length, encode.indexOf(';base64'));
  // const byteArray = new Uint8Array(binaryData.length);
  // for (let i = 0; i < binaryData.length; i++) {
  //   byteArray[i] = binaryData.charCodeAt(i);
  // }

  const blob = new Blob([encode], { type: mimeType });
  return new File([blob], fileName);
}

export async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  let blob = await response.blob();
  const mimeType = getMimeType(base64);
  if (mimeType) {
    // https://stackoverflow.com/a/50875615
    blob = blob.slice(0, blob.size, mimeType);
  }
  return blob;
}

const mimeRegex = /^data:(.+);base64,/;

/**
 * Gets MIME type from Base64.
 *
 * @param base64 - Base64.
 * @returns - MIME type.
 */
function getMimeType(base64: string) {
  return base64.match(mimeRegex)?.slice(1, 2).pop();
}
