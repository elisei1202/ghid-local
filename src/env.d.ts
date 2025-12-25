/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL: string;
  readonly ENVIRONMENT: 'development' | 'preview' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Cloudflare bindings
interface Env {
  DB: D1Database;
  KV: KVNamespace;
  IMAGES: R2Bucket;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    };
  }
}
