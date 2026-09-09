import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vendora",
    short_name: "Vendora",
    description:
      "The commerce operating system for African businesses.",

    start_url: "/pwa",
    scope: "/",

    display: "standalone",


  icons: [
  {
    src: "/icon.png",
    sizes: "any",
    type: "image/png",
  },
  {
    src: "/icon.png",
    sizes: "any",
    type: "image/png",
    purpose: "maskable",
  },
],
  };
}
