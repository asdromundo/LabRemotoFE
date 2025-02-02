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
          label: "Configuración",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Mi cuenta", slug: "account" },
          ],
        },
        {
          label: "Prácticas",
          autogenerate: { directory: "practicas" },
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
