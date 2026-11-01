import 'dotenv/config';
import { bootstrap, enabled, setupErrorMessage, waitForCouch } from './bootstrap.js';
try {
  if (enabled(process.env.CIMU_BOOTSTRAP)) {
    await waitForCouch();
    console.log('[CIMU setup]', JSON.stringify(await bootstrap()));
  }
  // No HTTP listener is opened until initialization has completed successfully.
  await import('../dist/server/entry.mjs');
} catch (error) {
  console.error('[CIMU startup]', setupErrorMessage(error));
  process.exitCode = 1;
}
