import { getDB } from './db';
import { ApplicationStatus } from '../domain/application';
import type { JobApplication } from '../domain/application';

export interface ApplicationRepository {
  getAll(): Promise<JobApplication[]>;
  getById(id: string): Promise<JobApplication | null>;
  create(application: JobApplication): Promise<void>;
  update(application: JobApplication): Promise<void>;
  updateStatus(id: string, status: ApplicationStatus): Promise<void>;
  delete(id: string): Promise<void>;
}

export class IndexedDBApplicationRepository
  implements ApplicationRepository
{
  async getAll(): Promise<JobApplication[]> {
    const db = await getDB();
    return db.getAll('applications');
  }

  async getById(id: string): Promise<JobApplication | null> {
    const db = await getDB();
    return (await db.get('applications', id)) ?? null;
  }

  async create(application: JobApplication): Promise<void> {
    const db = await getDB();
    await db.add('applications', application);
  }

  async update(application: JobApplication): Promise<void> {
    const db = await getDB();
    await db.put('applications', application);
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus
  ): Promise<void> {
    const db = await getDB();
    const existing = await db.get('applications', id);

    if (!existing) {
      throw new Error(`Application not found: ${id}`);
    }

    await db.put('applications', {
      ...existing,
      status,
      lastUpdated: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('applications', id);
  }
}
