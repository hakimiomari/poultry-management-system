// Web app manifest (served at /manifest.webmanifest): lets phones install PMS to the home screen and open it without browser chrome.
// Browsers fetch the manifest without cookies, so it cannot follow the user's language; the installed name stays "PMS".
import type { MetadataRoute } from "next";
import { t } from "@/lib/i18n";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: t("app.title", "EN"), short_name: t("app.short", "EN"), description: t("auth.blurb", "EN"),
    start_url: "/dashboard", scope: "/", display: "standalone",
    // Splash screen: the light page background behind the icon. theme_color is the brand blue (matches --primary in globals.css).
    background_color: "#f9f7f1", theme_color: "#2552aa",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
