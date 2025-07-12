import { Plugin } from "vite";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { version } from "../../package.json";

const Manifest = {
  manifest_version: 3,
  name: "Pretty Params",
  description: "Manage URL params and query strings in a demure way",
  version,
  options_ui: {
    page: "options.html",
    open_in_tab: true,
  },
  action: {
    default_icon: "icon.png",
    default_popup: "popup.html",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["content_script.js"],
    },
  ],
  host_permissions: ["<all_urls>"],
};

const FirefoxManifest = {
  permissions: ["storage", "tabs"],
  browser_specific_settings: {
    gecko: {
      id: "pretty-params@tona.dev",
    },
  },
};

const ChromeManifest = {
  background: {
    type: "module",
    service_worker: "service_worker.js",
  },
  permissions: ["storage", "tabs", "tabGroups"],
};

export function createFirefoxManifest(env: string): Plugin {
  const ManifestFile = {
    ...Manifest,
    ...FirefoxManifest,
    name: env === "production" ? Manifest.name : `${Manifest.name} (dev)`,
    action: {
      ...Manifest.action,
      default_icon: env === "production" ? "icon.png" : "icon-dev.png",
    },
  };

  return {
    name: "create-firefox-manifest",
    closeBundle: async () => {
      const firefoxDir = join(process.cwd(), "dist", "firefox");
      // Ensure firefox directory exists
      await mkdir(firefoxDir, { recursive: true });

      const manifestPath = join(firefoxDir, "manifest.json");
      try {
        await writeFile(
          manifestPath,
          JSON.stringify(ManifestFile, null, 2),
          "utf-8",
        );
        console.log("✅ Firefox manifest.json created successfully");
      } catch (error) {
        console.error("Error creating manifest.json:", error);
      }
    },
  };
}

export function createChromeManifest(env: string): Plugin {
  const ManifestFile = {
    ...Manifest,
    ...ChromeManifest,
    name: env === "production" ? Manifest.name : `${Manifest.name} (dev)`,
    action: {
      ...Manifest.action,
      default_icon: env === "production" ? "icon.png" : "icon-dev.png",
    },
  };

  return {
    name: "create-chrome-manifest",
    closeBundle: async () => {
      const chromeDir = join(process.cwd(), "dist", "chrome");
      await mkdir(chromeDir, { recursive: true });

      const manifestPath = join(chromeDir, "manifest.json");
      try {
        await writeFile(
          manifestPath,
          JSON.stringify(ManifestFile, null, 2),
          "utf-8",
        );
        console.log("✅ Chrome manifest.json created successfully");
      } catch (error) {
        console.error("Error creating manifest.json:", error);
      }
    },
  };
}
