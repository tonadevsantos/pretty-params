import { browser } from "@wxt-dev/browser";

export async function loadUrl() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (typeof tab?.url === "string") {
    return new URL(tab.url);
  }

  return "https://noop.com";
}
