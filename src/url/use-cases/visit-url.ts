export function visitChromeURL(url: string) {
  chrome.tabs.update({ url });
}

export function visitURL(url: string) {
  if (typeof chrome === "object") {
    return visitChromeURL(url);
  }
}
