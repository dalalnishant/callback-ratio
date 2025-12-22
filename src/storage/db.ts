import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { JobApplication } from '../domain/application';


interface CallbackRatioDB extends DBSchema {
  applications: {
    key: string;
    value: JobApplication;
    indexes: {
      'by-status': string;
      'by-appliedDate': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<CallbackRatioDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CallbackRatioDB>('callback-ratio-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('applications', {
          keyPath: 'id',
        });

        store.createIndex('by-status', 'status');
        store.createIndex('by-appliedDate', 'appliedDate');
      },
    });
  }

  return dbPromise;
}
