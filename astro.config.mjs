import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  // Used for canonical and Open Graph URLs.
  site: 'https://www.renofitness.ca',
  output: 'static',
  outDir: 'dist',
  publicDir: 'static',
  srcDir: 'src',
  // Astro 7's default ('jsx') removes line breaks between inline elements, running words
  // together wherever a link starts on its own line.
  compressHTML: true,
  integrations: [preact()],
  server: {
    port: 4321
  }
});
