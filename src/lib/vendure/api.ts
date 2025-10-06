import { graphql, type ResultOf, type VariablesOf } from '@/graphql';
import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';
import { getAuthToken } from '@/lib/auth';

const VENDURE_API_URL = process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
const VENDURE_AUTH_TOKEN_HEADER = 'vendure-auth-token';

if (!VENDURE_API_URL) {
  throw new Error('VENDURE_SHOP_API_URL or NEXT_PUBLIC_VENDURE_SHOP_API_URL environment variable is not set');
}

interface VendureRequestOptions {
  languageCode?: string;
  token?: string;
  useAuthToken?: boolean;
  fetch?: RequestInit;
  tags?: string[];
}

interface VendureResponse<T> {
  data?: T;
  errors?: Array<{ message: string; [key: string]: any }>;
}

/**
 * Extract the Vendure auth token from response headers
 */
function extractAuthToken(headers: Headers): string | null {
  return headers.get(VENDURE_AUTH_TOKEN_HEADER);
}

/**
 * Build the API URL with optional language code
 */
function buildUrl(languageCode?: string): string {
  const url = new URL(VENDURE_API_URL!);
  if (languageCode) {
    url.searchParams.set('languageCode', languageCode);
  }
  return url.toString();
}

/**
 * Execute a GraphQL query against the Vendure API
 */
export async function query<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: VendureRequestOptions]
    : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
  const { languageCode, token, useAuthToken, fetch: fetchOptions, tags } = options || {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions?.headers as Record<string, string>),
  };

  // Use the explicitly provided token, or fetch from cookies if useAuthToken is true
  let authToken = token;
  if (useAuthToken && !authToken) {
    authToken = await getAuthToken();
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(buildUrl(languageCode), {
    ...fetchOptions,
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: print(document),
      variables: variables || {},
    }),
    ...(tags && { next: { tags } }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: VendureResponse<TResult> = await response.json();

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  if (!result.data) {
    throw new Error('No data returned from Vendure API');
  }

  const newToken = extractAuthToken(response.headers);

  return {
    data: result.data,
    ...(newToken && { token: newToken }),
  };
}

/**
 * Execute a GraphQL mutation against the Vendure API
 */
export async function mutate<TResult, TVariables>(
  document: TadaDocumentNode<TResult, TVariables>,
  ...[variables, options]: TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: VendureRequestOptions]
    : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
  // Mutations use the same underlying implementation as queries in GraphQL
  return query(document, ...[variables, options] as any);
}
