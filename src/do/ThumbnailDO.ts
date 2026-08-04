import type { DurableObject } from 'cloudflare:workers';

export interface ThumbnailData {
  id: string;
  name: string;
  theme: string;
  elements: unknown[];
  activeTool: string;
  showGridGuides: boolean;
  snappingEnabled: boolean;
  centerSnapMode: boolean;
  previewMode: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ThumbnailSummary {
  id: string;
  name: string;
  updatedAt: number;
}

export class ThumbnailDO implements DurableObject {
  private sql: SqlStorage;

  constructor(private ctx: DurableObjectState) {
    this.sql = ctx.storage.sql;
    this.ensureSchema();
  }

  private ensureSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS thumbnails (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/thumbnails' && request.method === 'GET') {
        return this.listThumbnails();
      }

      // Which thumbnails use each image. The picker warns with this before deleting
      // an upload, and asking here costs one request instead of one per thumbnail.
      if (path === '/api/thumbnails/image-usage' && request.method === 'GET') {
        return this.listImageUsage();
      }

      if (path === '/api/thumbnails' && request.method === 'POST') {
        return this.createThumbnail(await request.json() as ThumbnailData);
      }

      const thumbnailMatch = path.match(/^\/api\/thumbnails\/([^/]+)$/);
      if (thumbnailMatch) {
        const id = thumbnailMatch[1];

        if (request.method === 'GET') {
          return this.getThumbnail(id);
        }
        if (request.method === 'PUT') {
          return this.updateThumbnail(id, await request.json() as ThumbnailData);
        }
        if (request.method === 'DELETE') {
          return this.deleteThumbnail(id);
        }
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  private listImageUsage(): Response {
    const rows = this.sql.exec<{ name: string; data: string }>(`SELECT name, data FROM thumbnails`);
    const usage: Record<string, string[]> = {};

    for (const row of rows) {
      // The reference format is img:<sha-256>, wherever it appears in the record
      const seen = new Set<string>();
      for (const match of row.data.matchAll(/img:([a-f0-9]{64})/g)) {
        if (seen.has(match[1])) continue;
        seen.add(match[1]);
        (usage[match[1]] ??= []).push(row.name || 'Untitled Thumbnail');
      }
    }

    return new Response(JSON.stringify(usage), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private listThumbnails(): Response {
    const rows = this.sql.exec<{
      id: string;
      name: string;
      updated_at: number;
    }>(`SELECT id, name, updated_at FROM thumbnails ORDER BY created_at DESC`);

    const thumbnails: ThumbnailSummary[] = [];
    for (const row of rows) {
      thumbnails.push({
        id: row.id,
        name: row.name,
        updatedAt: row.updated_at,
      });
    }

    return new Response(JSON.stringify(thumbnails), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private getThumbnail(id: string): Response {
    const rows = this.sql.exec<{ data: string }>(
      `SELECT data FROM thumbnails WHERE id = ?`,
      id
    );

    for (const row of rows) {
      return new Response(row.data, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Thumbnail not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private createThumbnail(data: ThumbnailData): Response {
    const now = Date.now();
    const id = data.id || crypto.randomUUID();
    const name = data.name || 'Untitled Thumbnail';

    const thumbnail: ThumbnailData = {
      ...data,
      id,
      name,
      createdAt: now,
      updatedAt: now,
    };

    this.sql.exec(
      `INSERT INTO thumbnails (id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      id,
      name,
      JSON.stringify(thumbnail),
      now,
      now
    );

    return new Response(JSON.stringify(thumbnail), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private updateThumbnail(id: string, data: ThumbnailData): Response {
    const now = Date.now();

    // Check if exists
    const existing = this.sql.exec<{ id: string }>(
      `SELECT id FROM thumbnails WHERE id = ?`,
      id
    );

    let found = false;
    for (const _ of existing) {
      found = true;
      break;
    }

    if (!found) {
      return new Response(JSON.stringify({ error: 'Thumbnail not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const thumbnail: ThumbnailData = {
      ...data,
      id,
      updatedAt: now,
    };

    this.sql.exec(
      `UPDATE thumbnails SET name = ?, data = ?, updated_at = ? WHERE id = ?`,
      thumbnail.name || 'Untitled Thumbnail',
      JSON.stringify(thumbnail),
      now,
      id
    );

    return new Response(JSON.stringify(thumbnail), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private deleteThumbnail(id: string): Response {
    this.sql.exec(`DELETE FROM thumbnails WHERE id = ?`, id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
