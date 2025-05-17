import { defineConfig, UserConfig, createLogger } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react-swc";
import {
  createChromeManifest,
  createFirefoxManifest,
} from "./src/manifests/main";

const config: UserConfig = {
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        options: resolve(__dirname, "options.html"),
        service_worker: resolve(
          __dirname,
          "src/core/infra/browser/background.ts",
        ),
        content_script: resolve(
          __dirname,
          "src/core/infra/browser/content-script.ts",
        ),
      },
      output: {
        chunkFileNames: "[name].[hash].js",
        assetFileNames: "[name].[hash].[ext]",
        entryFileNames: "[name].js",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
};

function getFirefoxConfig(env: string): UserConfig {
  return {
    ...config,
    plugins: [...(config.plugins ?? []), createFirefoxManifest(env)],
    build: {
      ...config.build,
      outDir: "dist/firefox",
      rollupOptions: {
        ...config.build?.rollupOptions,
        output: {
          ...config.build?.rollupOptions?.output,
          dir: "dist/firefox",
        },
      },
    },
  };
}

function getChromeConfig(env: string): UserConfig {
  return {
    ...config,
    plugins: [...(config.plugins ?? []), createChromeManifest(env)],
    build: {
      ...config.build,
      outDir: "dist/chrome",
      rollupOptions: {
        ...config.build?.rollupOptions,
        output: {
          ...config.build?.rollupOptions?.output,
          dir: "dist/chrome",
        },
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const browser = process.env.BROWSER as string;

  if (browser === "firefox") {
    return getFirefoxConfig(mode);
  } else if (browser === "chrome") {
    return getChromeConfig(mode);
  }

  const logger = createLogger();

  logger.error(
    "Please set a BROWSER environment variable when working with this project",
  );
  process.exit(1);
});
