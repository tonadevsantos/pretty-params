export type AppURL = URL;

export type AppURLSearchParams = [string, string][];

export function listURLSearchParams(url: URL) {
  return Array.from(new URLSearchParams(url.search).entries()).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );
}
