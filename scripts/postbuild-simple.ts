import { mkdir, writeFile, cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loader, multiple, source as createSource } from 'fumadocs-core/source';
import { openapiPlugin, openapiSource } from 'fumadocs-openapi/server';
import { getDocSourceFiles } from './lib/content';
import { getManifestKey } from '../src/lib/docs-manifest';
import { openapi } from '../src/lib/openapi';
import { preparePageTree } from '../src/lib/page-tree';
import { site } from './lib/site';
import { currentDirFromMetaUrl } from './lib/runtime-path';

const currentDir = currentDirFromMetaUrl(import.meta.url);

function getDocOgPath(slugs: string[]): string {
  if (slugs.length === 0) return `${site.docsBasePath}/og/index.png`;
  return `${site.docsBasePath}/og/${slugs.join('/')}.png`;
}

function getDocMarkdownPath(slugs: string[]): string {
  const segments = [...slugs, 'content.md'];
  return `${site.docsBasePath}/llms.mdx/docs/${segments.join('/')}`;
}

async function writeDocsManifest() {
  const outputRoot = resolve(currentDir, '../.output/public');
  const distClient = resolve(currentDir, '../dist/client');
  const { metas, pages: sourcePages } = await getDocSourceFiles();
  const docsSource = loader(
    multiple({
      docs: createSource({ metas, pages: sourcePages }),
      openapi: await openapiSource(openapi, {
        baseDir: 'api-reference/api',
        groupBy: 'tag',
      }),
    }),
    {
      baseUrl: '/',
      plugins: [openapiPlugin()],
    },
  );
  const pageTree = await docsSource.serializePageTree(preparePageTree(docsSource.getPageTree()));
  const pages = Object.fromEntries(
    await Promise.all(docsSource.getPages().map(async (page) => {
      const base = {
        description: page.data.description ?? site.description,
        isIndex: page.slugs.length === 0,
        ogImagePath: getDocOgPath(page.slugs),
        title: page.data.title,
        url: page.url === '/' ? site.docsBasePath : `${site.docsBasePath}${page.url}`,
      };

      return [
        getManifestKey(page.slugs),
        page.data.type === 'openapi'
          ? {
              ...base,
              type: 'openapi',
              props: await page.data.getClientAPIPageProps(),
            }
          : {
              ...base,
              type: 'docs',
              markdownUrl: getDocMarkdownPath(page.slugs),
              path: page.path,
            },
      ];
    })),
  );

  const manifestContent = JSON.stringify({ pageTree, pages }, null, 2);
  await mkdir(outputRoot, { recursive: true });
  await writeFile(resolve(outputRoot, 'docs-manifest.json'), manifestContent, 'utf8');
  // Also copy to dist/client for vite preview
  await mkdir(distClient, { recursive: true });
  await writeFile(resolve(distClient, 'docs-manifest.json'), manifestContent, 'utf8');
  // Also copy to dist/client/docs so it's accessible at /docs/docs-manifest.json
  const docsDir = resolve(distClient, 'docs');
  await mkdir(docsDir, { recursive: true });
  await writeFile(resolve(docsDir, 'docs-manifest.json'), manifestContent, 'utf8');
  console.log(`docs-manifest.json generated with ${Object.keys(pages).length} pages.`);
}

async function copyBaseScopedPublicAssets() {
  const distClient = resolve(currentDir, '../dist/client');
  const publicImages = resolve(currentDir, '../public/images');
  const docsImages = resolve(distClient, 'docs/images');
  const publicBrand = resolve(currentDir, '../public/brand');
  const docsBrand = resolve(distClient, 'docs/brand');
  const publicManifest = resolve(currentDir, '../public/site.webmanifest');
  const docsManifest = resolve(distClient, 'docs/site.webmanifest');

  try {
    await cp(publicImages, docsImages, { recursive: true, force: true });
  } catch {
    // public/images may not exist
  }
  await cp(publicBrand, docsBrand, { recursive: true, force: true });
  await cp(publicManifest, docsManifest, { force: true });
}

await writeDocsManifest();
await copyBaseScopedPublicAssets();

const distClient = resolve(currentDir, '../dist/client');
const shellHtml = resolve(distClient, '_shell.html');
const indexHtml = resolve(distClient, 'index.html');
const notFoundHtml = resolve(distClient, '404.html');
try {
  await cp(shellHtml, indexHtml);
  console.log('Copied _shell.html to index.html for GitHub Pages.');
} catch {
  // _shell.html may not exist
}

// GitHub Pages SPA fallback: serve the app shell on 404 so client-side routing can take over
try {
  await cp(shellHtml, notFoundHtml);
  console.log('Copied _shell.html to 404.html for GitHub Pages SPA fallback.');
} catch {
  // _shell.html may not exist
}

console.log('Postbuild completed: docs-manifest.json generated and assets copied.');
