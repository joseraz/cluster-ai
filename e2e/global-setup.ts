import { rmSync } from 'fs';
import { join } from 'path';

/** Start every E2E run from a clean, isolated database (incl. WAL residue). */
export default function globalSetup() {
  for (const suffix of ['', '-wal', '-shm']) {
    rmSync(join(process.cwd(), 'data', `e2e.db${suffix}`), { force: true });
  }
}
