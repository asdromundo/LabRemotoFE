// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://labremotomd.fi-p.unam.mx",
  integrations: [
    starlight({
      title: "Laboratorio Remoto ASyS",
      logo: {
        src: "./src/assets/logo-fi.svg",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      // Establece el español como el idioma predeterminado para este sitio.
      defaultLocale: "root",
      locales: {
        // Documentación en español en `src/content/docs/`
        root: {
          label: "Español",
          lang: "es",
        },
      },
      customCss: ["./src/tailwind.css"],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
});
