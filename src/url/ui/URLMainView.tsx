import { useEffect, useState } from "react";
import { loadUrl } from "@/url/use-cases/load-url";
import { URLForm } from "./URLForm";
import { DotIcon } from "lucide-react";

export function URLMainView() {
  const [url, setUrl] = useState<URL | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const url = await loadUrl();
        if (url instanceof URL) {
          setUrl(url);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred";
        setError(message);
      }
    }

    init();
  }, []);

  return (
    <main>
      {error ? <p>{error}</p> : null}
      {url ? (
        <div className="mt-2">
          <div className="bg-neutral-100 pr-4 py-4 pl-6 flex items-center">
            <p className="text-md text-ellipsis overflow-hidden whitespace-nowrap">
              {url.href}
            </p>
            <div className="flex-1">
              <div className="flex justify-end items-center">
                <button
                  className="text-sm text-blue-500"
                  onClick={() => {
                    navigator.clipboard.writeText(url.href);
                  }}
                >
                  <DotIcon size="2rem" />
                </button>
              </div>
            </div>
          </div>
          <div className="mb-2">
            <URLForm url={url} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
