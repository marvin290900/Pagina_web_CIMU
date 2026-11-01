import 'dotenv/config';
import { initDatabases } from '../lib/security/databases.js';
import { waitForCouch, setupErrorMessage } from '../../scripts/bootstrap.js';
// Legacy database-only command. Use npm run db:setup for the first account and configuration.
try {
  await waitForCouch();
  await initDatabases();
  console.log('Bases e índices preparados. Para una instalación nueva utiliza npm run db:setup.');
} catch (error) {
  console.error(setupErrorMessage(error));
  process.exitCode = 1;
}
