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
  vite: {
    optimizeDeps: {
      // @preact/preset-vite sets automatic JSX for Vite's dependency scan but not the import
      // source, so the scan looks for react/jsx-dev-runtime and skips pre-bundling.
      // TODO: remove once @preact/preset-vite passes importSource there itself.
      rolldownOptions: {
        transform: {
          jsx: { runtime: 'automatic', importSource: 'preact' }
        }
      }
    }
  },
  server: {
    port: 4321
  }
});
