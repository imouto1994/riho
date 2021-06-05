import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    VitePWA({
      srcDir: "src",
      manifest: {
        background_color: "#000",
        name: "Riho",
        orientation: "portrait",
        short_name: "Riho",
        start_url: "/",
        theme_color: "#000",
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
