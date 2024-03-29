import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    VitePWA({
      manifest: {
        background_color: "#000",
        name: "Riho",
        orientation: "portrait",
        short_name: "Riho",
        start_url: "https://riho94.noobsaigon.com/",
        scope: "https://riho94.noobsaigon.com/",
        theme_color: "#000",
        display: "standalone",
        icons: [
          {
            src: "/icon-192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "/icon-512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
      },
      injectRegister: "inline",
      strategies: "injectManifest",
      injectManifest: {
        globDirectory: "dist/",
        globPatterns: ["**/*.js", "**/*.css", "index.html"],
        dontCacheBustURLsMatching: /\.js$/,
      },
    }),
  ],
});
