import fs from 'fs';
import path from 'path';

const projectRoot = path.join(path.dirname(import.meta.url).replace('file://', ''), '..');
const fumadocsDir = path.join(projectRoot, 'node_modules/fumadocs-openapi');

if (!fs.existsSync(fumadocsDir)) {
  console.log('fumadocs-openapi not found, skipping fix');
  process.exit(0);
}

// Directory where fumadocs-openapi bundles its dependencies internally
const internalPnpmDir = path.join(fumadocsDir, 'dist/node_modules/.pnpm');

// Map of bundled packages: pkgName -> { version, basePath }
function getBundledPackages() {
  const packages = new Map();
  if (!fs.existsSync(internalPnpmDir)) return packages;

  for (const entry of fs.readdirSync(internalPnpmDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    // entry.name looks like "xml-js@1.6.11" or "@scalar/openapi-upgrader@0.2.9"
    const atMatch = entry.name.match(/^(@[^/]+\/[^@]+)@(.+)$/);
    const plainMatch = entry.name.match(/^([^@][^/]*)@(.+)$/);

    let pkgName, version;
    if (atMatch) {
      pkgName = atMatch[1];
      version = atMatch[2];
    } else if (plainMatch) {
      pkgName = plainMatch[1];
      version = plainMatch[2];
    } else {
      continue;
    }

    const basePath = path.join(internalPnpmDir, entry.name, 'node_modules', pkgName);
    if (fs.existsSync(basePath)) {
      packages.set(pkgName, { version, basePath });
    }
  }
  return packages;
}

// Rewrite imports in a file that point to root node_modules to use internal bundled versions
function rewriteImports(filePath, bundledPackages) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Match: from "../../../../<pkg>/<subpath>"  or  from "../../../<pkg>/<subpath>"
  // where <pkg> is a package name (not starting with . or @) or @scope/name
  // These are relative paths that escape fumadocs-openapi/dist and point to root node_modules
  const importPattern = /from\s+["'](\.\.\/)+((?:@[^/]+\/)?[^./@][^"']*)["']/g;

  content = content.replace(importPattern, (match, dots, pkgAndSubPath) => {
    // Determine package name and subpath
    let pkgName, subPath;
    if (pkgAndSubPath.startsWith('@')) {
      const parts = pkgAndSubPath.split('/');
      pkgName = parts[0] + '/' + parts[1];
      subPath = parts.slice(2).join('/');
    } else {
      const parts = pkgAndSubPath.split('/');
      pkgName = parts[0];
      subPath = parts.slice(1).join('/');
    }

    const bundled = bundledPackages.get(pkgName);
    if (!bundled) return match;

    // Check the target file exists in the bundled version
    const targetPath = subPath ? path.join(bundled.basePath, subPath) : bundled.basePath;
    if (!fs.existsSync(targetPath)) return match;

    const relative = path.relative(path.dirname(filePath), targetPath).replace(/\\/g, '/');
    modified = true;
    return `from "${relative.startsWith('.') ? relative : './' + relative}"`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

// Also fix the old pnpm hardcoded paths (legacy)
function resolvePackagePath(pkgName, subPath) {
  const pkgJsonPath = path.join(projectRoot, 'node_modules', pkgName, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    return path.join(projectRoot, 'node_modules', pkgName, subPath);
  }
  return null;
}

function fixLegacyPnpmPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  const pnpmPattern = /["'](\.\.\/)+node_modules\/\.pnpm\/[^/]+\/node_modules\/([^"']+)["']/g;

  content = content.replace(pnpmPattern, (match, dots, pkgPath) => {
    const parts = pkgPath.split('/');
    let pkgName = parts[0];
    if (pkgName.startsWith('@')) {
      pkgName = parts[0] + '/' + parts[1];
      const subPath = parts.slice(2).join('/');
      const resolved = resolvePackagePath(pkgName, subPath);
      if (resolved) {
        modified = true;
        const relative = path.relative(path.dirname(filePath), resolved).replace(/\\/g, '/');
        return `"${relative.startsWith('.') ? relative : './' + relative}"`;
      }
    } else {
      const subPath = parts.slice(1).join('/');
      const resolved = resolvePackagePath(pkgName, subPath);
      if (resolved) {
        modified = true;
        const relative = path.relative(path.dirname(filePath), resolved).replace(/\\/g, '/');
        return `"${relative.startsWith('.') ? relative : './' + relative}"`;
      }
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

const bundledPackages = getBundledPackages();
console.log(`Found ${bundledPackages.size} bundled packages:`, [...bundledPackages.keys()].join(', '));

function traverse(dir) {
  // Skip the internal bundled node_modules directory
  if (dir.includes(path.join('dist', 'node_modules'))) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      traverse(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      fixLegacyPnpmPaths(fullPath);
      const rewritten = rewriteImports(fullPath, bundledPackages);
      if (rewritten) {
        console.log(`Rewrote imports in ${path.relative(fumadocsDir, fullPath)}`);
      }
    }
  }
}

traverse(path.join(fumadocsDir, 'dist'));
console.log('Fixed fumadocs-openapi import paths');
