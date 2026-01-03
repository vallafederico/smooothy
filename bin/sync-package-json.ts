#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PackageConfig {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  license?: string;
  repository?: {
    type: string;
    url: string;
  };
  bugs?: {
    url: string;
  };
  homepage?: string;
  keywords?: string[];
}

interface PackageJson {
  [key: string]: any;
}

// Fields to sync to root package.json
const ROOT_FIELDS = [
  'name',
  'version',
  'description',
  'author',
  'license',
  'repository',
  'bugs',
  'homepage',
  'keywords',
] as const;

// Fields to sync to package/package.json
const PACKAGE_FIELDS = ['name', 'version'] as const;

// Fields to sync to web/package.json
const WEB_FIELDS = ['name', 'version'] as const;

function readJsonFile(path: string): any {
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${path}:`, error);
    process.exit(1);
  }
}

function writeJsonFile(path: string, data: any): void {
  try {
    const content = JSON.stringify(data, null, 2) + '\n';
    writeFileSync(path, content, 'utf-8');
    console.log(`✓ Updated ${path}`);
  } catch (error) {
    console.error(`Error writing ${path}:`, error);
    process.exit(1);
  }
}

function syncFields(
  target: PackageJson,
  source: PackageConfig,
  fields: readonly string[]
): PackageJson {
  const updated = { ...target };
  for (const field of fields) {
    if (source[field as keyof PackageConfig] !== undefined) {
      updated[field] = source[field as keyof PackageConfig];
    }
  }
  return updated;
}

async function main() {
  const rootDir = join(import.meta.dir, '..');
  const configPath = join(rootDir, 'package.config.json');
  const rootPackagePath = join(rootDir, 'package.json');
  const packagePackagePath = join(rootDir, 'package', 'package.json');
  const webPackagePath = join(rootDir, 'web', 'package.json');

  console.log('🔄 Syncing package.json files...\n');

  // Read config
  const config: PackageConfig = readJsonFile(configPath);
  console.log(`📋 Using config from ${configPath}\n`);

  // Sync root package.json
  const rootPackage = readJsonFile(rootPackagePath);
  const updatedRoot = syncFields(rootPackage, config, ROOT_FIELDS);
  writeJsonFile(rootPackagePath, updatedRoot);

  // Sync package/package.json
  const packagePackage = readJsonFile(packagePackagePath);
  const updatedPackage = syncFields(packagePackage, config, PACKAGE_FIELDS);
  writeJsonFile(packagePackagePath, updatedPackage);

  // Sync web/package.json
  const webPackage = readJsonFile(webPackagePath);
  const updatedWeb = syncFields(webPackage, config, WEB_FIELDS);
  writeJsonFile(webPackagePath, updatedWeb);

  console.log('\n✅ All package.json files synced successfully!');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

