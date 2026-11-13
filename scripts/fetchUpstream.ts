const TAIPEI_DATA_ORIGIN = 'https://data.taipei';
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;
const DEFAULT_MAX_BYTES = 16 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 60_000;

type DownloadOptions = {
  manualUrl?: boolean;
  maxBytes?: number;
  timeoutMs?: number;
};

function validateSource(url: URL, approvedOrigin: string) {
  if (url.protocol !== 'https:' || url.origin !== approvedOrigin || url.username || url.password) {
    throw new Error(`Upstream URL must use HTTPS on the approved origin (${approvedOrigin}).`);
  }
}

async function readBoundedBody(response: Response, maxBytes: number) {
  if (!response.body) return null;

  const contentLength = response.headers.get('content-length');
  if (contentLength !== null && Number(contentLength) > maxBytes) {
    void response.body.cancel().catch(() => {});
    throw new Error(`Upstream response exceeds ${maxBytes} bytes.`);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error(`Upstream response exceeds ${maxBytes} bytes.`);
      chunks.push(value);
    }
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function fetchUpstream(
  source: string,
  { manualUrl = false, maxBytes = DEFAULT_MAX_BYTES, timeoutMs = DEFAULT_TIMEOUT_MS }: DownloadOptions = {},
): Promise<Pick<Response, 'ok' | 'status' | 'statusText' | 'text' | 'arrayBuffer'>> {
  let url = new URL(source);
  // Only an explicit maintainer --url can select a different starting origin.
  const approvedOrigin = manualUrl ? url.origin : TAIPEI_DATA_ORIGIN;
  const signal = AbortSignal.timeout(timeoutMs);

  for (let redirects = 0; ; redirects++) {
    validateSource(url, approvedOrigin);
    const response = await fetch(url, { redirect: 'manual', signal });
    if (!REDIRECT_STATUSES.has(response.status)) {
      if (!response.ok) void response.body?.cancel().catch(() => {});
      const bytes = response.ok ? await readBoundedBody(response, maxBytes) : null;
      return new Response(bytes, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    void response.body?.cancel().catch(() => {});
    const location = response.headers.get('location');
    if (!location) throw new Error('Upstream redirect is missing its destination.');
    if (redirects === MAX_REDIRECTS) throw new Error('Upstream exceeded the redirect limit.');
    url = new URL(location, url);
  }
}
