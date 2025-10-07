import { initDatabases } from '../lib/auth.js';

console.log('🔧 Inicializando bases de datos...');

initDatabases()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
