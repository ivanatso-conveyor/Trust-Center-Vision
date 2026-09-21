import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves this project from https://ivanatso-conveyor.github.io/Trust-Center-Vision/
// so production builds (and `vite preview` of them) must be rooted at that
// subpath. The dev server stays at "/".
const GITHUB_PAGES_BASE = '/Trust-Center-Vision/'

// GitHub Pages has no SPA rewrite rule: refreshing a deep link like
// /Trust-Center-Vision/trust-center/agent would return the platform 404 page.
// Shipping index.html as 404.html lets the app boot on any path and let
// React Router resolve the route client-side.
function spaFallbackForGitHubPages() {
  let outDir = 'dist'
  return {
    name: 'spa-fallback-for-github-pages',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? GITHUB_PAGES_BASE : '/',
  plugins: [react(), tailwindcss(), spaFallbackForGitHubPages()],
}))
