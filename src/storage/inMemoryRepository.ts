import type { JobApplication, ApplicationStatus } from '../domain/application';
import type { ApplicationRepository } from './applicationRepository';

export class InMemoryApplicationRepository implements ApplicationRepository {
  private applications: JobApplication[] = [];

  async getAll(): Promise<JobApplication[]> {
    return this.applications;
  }

  async getById(id: string): Promise<JobApplication | null> {
    const app = this.applications.find((a) => a.id === id);
    return app ?? null;
  }

  async create(app: JobApplication): Promise<void> {
    this.applications.push(app);
  }

  async update(app: JobApplication): Promise<void> {
    const idx = this.applications.findIndex((a) => a.id === app.id);
    if (idx >= 0) this.applications[idx] = app;
  }

  async delete(id: string): Promise<void> {
    this.applications = this.applications.filter((a) => a.id !== id);
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<void> {
    const idx = this.applications.findIndex((a) => a.id === id);
    if (idx >= 0) {
      this.applications[idx].status = status;
      this.applications[idx].lastUpdated = new Date().toISOString();
    }
  }
}
