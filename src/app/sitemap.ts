import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://childcareos.vercel.app";
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/dashboard`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/guardian`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
