import type { ThumbnailState } from '../types';
import type { StorageAdapter, ThumbnailRecord, ThumbnailSummary } from './types';
import { getStateToPersist } from './serialize';

const STORAGE_KEY = 'thumbatic-thumbnails';

function readAll(): ThumbnailRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: ThumbnailRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function toSummary(record: ThumbnailRecord): ThumbnailSummary {
  return { id: record.id, name: record.name, updatedAt: record.updatedAt };
}

export class LocalStorageAdapter implements StorageAdapter {
  async list(): Promise<ThumbnailSummary[]> {
    return readAll()
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(toSummary);
  }

  async get(id: string): Promise<ThumbnailRecord> {
    const record = readAll().find(r => r.id === id);
    if (!record) throw new Error('Thumbnail not found');
    return record;
  }

  async create(name: string, state: ThumbnailState): Promise<ThumbnailRecord> {
    const records = readAll();
    const record: ThumbnailRecord = {
      ...getStateToPersist(state),
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    records.push(record);
    writeAll(records);
    return record;
  }

  async save(id: string, state: ThumbnailState): Promise<ThumbnailRecord> {
    const records = readAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Thumbnail not found');
    const record: ThumbnailRecord = {
      ...getStateToPersist(state),
      id,
      createdAt: records[index].createdAt,
    };
    records[index] = record;
    writeAll(records);
    return record;
  }

  async delete(id: string): Promise<void> {
    writeAll(readAll().filter(r => r.id !== id));
  }
}
