# CIMU · Editorial y Gaceta

Sitio construido con Astro SSR, Vue, Tailwind y CouchDB para libros, investigaciones, la Gaceta Multidisciplinaria y consulta de REMI.

```sh
npm install
npm run dev
```

Requiere Node 22.16 o posterior y las variables `COUCHDB_URL`, `COUCHDB_USER` y `COUCHDB_PASSWORD`. En producción se utiliza HTTPS y almacenamiento persistente para los archivos privados.

El sistema de acceso tiene cuentas individuales, roles con alcance por módulo/sección y revisión editorial. Para utilizar cuentas existentes, ejecutar primero la simulación de migración y seguir el [procedimiento de operación](docs/operacion-accesos.md).

```sh
npm run access:migrate
npm test
npm run test:integration
npm run build
npm start
```

La simulación no escribe datos. Las opciones de aplicación, el respaldo requerido y las limitaciones de archivos históricos se detallan en la guía.

- [Plan de roles y permisos](docs/plan-roles-permisos.md)
- [Operación, migración y pruebas](docs/operacion-accesos.md)
