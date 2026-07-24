import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChildcareOS",
    short_name: "ChildcareOS",
    description: "Safety operations for childcare centers.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F7F3EA",
    theme_color: "#0D9488",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
