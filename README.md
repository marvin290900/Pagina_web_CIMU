# CIMU · Editorial y Gaceta

Sitio construido con Astro SSR, Vue, Tailwind y CouchDB para libros, investigaciones, la Gaceta Multidisciplinaria y consulta de REMI.

**¿Es tu primera vez en el proyecto?** Empieza por el [roadmap de lectura y primer arranque](docs/roadmap-lectura.md), con rutas según tu objetivo, pasos y ejemplos de Compose.

## Instalación nueva con Docker

Desde esta carpeta:

```sh
cp -n .env.example .env
```

Completa en `.env` las contraseñas de CouchDB y de la primera cuenta, además de `CIMU_ADMIN_EMAIL` y `CIMU_ADMIN_NAME`. No hay contraseña administrativa predeterminada. `CIMU_SEED_DEMO=true` carga ejemplos ficticios solo en una instalación vacía; usa `false` para comenzar sin publicaciones.

```sh
docker compose up --build -d
docker compose ps -a
```

Abre **http://localhost:8081/login** y utiliza el correo y la contraseña que configuraste. El arranque crea las bases, la configuración y una cuenta con administración y dirección editorial. Los siguientes arranques conservan las credenciales, las asignaciones y los documentos existentes. Los datos de prueba eliminados o editados no se vuelven a cargar.

La [guía de instalación inicial](docs/instalacion-inicial.md) explica puertos, volúmenes, ejemplos, reanudación y uso en un Compose anterior. La configuración incluida sirve para acceso local; un despliegue público requiere HTTPS y su configuración de proxy.

## Desarrollo o instalación anterior

Requiere Node 22.16 o posterior y las variables `COUCHDB_URL`, `COUCHDB_USER` y `COUCHDB_PASSWORD` apuntando a un CouchDB disponible.

```sh
npm ci
npm run dev
```

Para inicializar una base vacía fuera de Docker, configura también `CIMU_ADMIN_*` y ejecuta `npm run db:setup`. Para adaptar cuentas y contenido existentes sin política nueva, utiliza primero la simulación de migración y sigue el [procedimiento de operación](docs/operacion-accesos.md).

```sh
npm run access:migrate
npm test
npm run test:integration
npm run build
npm start
```

`access:migrate` simula por defecto; `db:setup` sí escribe la inicialización. `npm start` ejecuta la inicialización automáticamente solo si `CIMU_BOOTSTRAP=true`. El archivo de ejemplo y el Compose incluido activan esa opción por defecto.

## Documentación

- [Roadmap de lectura y primer arranque](docs/roadmap-lectura.md)
- [Estado de la documentación y pendientes de entrega](docs/estado-documentacion.md)
- [Manual de desarrollo](docs/manual-desarrollo.md)
- [Manual de producción para el equipo de servidores de la universidad](docs/manual-produccion.md)
- [Instalación inicial y datos de prueba](docs/instalacion-inicial.md)
- [Manual de roles, permisos y flujo editorial](docs/manual-roles-permisos.md)
- [Estructura de CouchDB, login e interpretación de auditoría](docs/estructura-base-datos.md)
- [Operación, migración y pruebas](docs/operacion-accesos.md)
- [Plan de roles y permisos](docs/plan-roles-permisos.md)
