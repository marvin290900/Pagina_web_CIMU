# Instalación inicial con Docker

Revisión: 28 de octubre de 2026. Este procedimiento es para una instalación nueva. El repositorio incluye `compose.yaml`, la imagen del frontend, Nginx y configuración de CouchDB de un solo nodo.

## 1. Preparar el entorno

Requisitos: Git, Docker con el complemento `docker compose` y puertos locales disponibles. No necesitas instalar Node en el equipo para ejecutar los contenedores.

Desde la raíz de este repositorio:

```sh
cp -n .env.example .env
```

Edita `.env` y completa:

```dotenv
COUCHDB_USER=cimu_service
COUCHDB_PASSWORD='TU_CONTRASEÑA_PROPIA_PARA_COUCHDB'
CIMU_ADMIN_EMAIL=tu.correo@institucion.edu.sv
CIMU_ADMIN_NAME='Tu nombre'
CIMU_ADMIN_PASSWORD='TU_CONTRASEÑA_PROPIA_PARA_EL_PANEL'
CIMU_SEED_DEMO=true
```

Los valores en mayúsculas son indicaciones, no contraseñas para utilizar. Elige dos contraseñas distintas. La del panel necesita al menos 12 caracteres y como máximo 72 bytes UTF-8. Las comillas simples de `.env` permiten conservar caracteres como `$` sin interpretarlos.

La cuenta de CouchDB es una cuenta del servidor de base de datos. La cuenta `CIMU_ADMIN_EMAIL` es la persona que ingresará al panel. No son la misma cuenta. No hay una contraseña administrativa común ni se imprime una contraseña en los logs.

`cp -n` conserva un `.env` que ya exista. Si estás trabajando con una instalación previa, no reemplaces su configuración por la del ejemplo. Este Compose tiene volúmenes propios; no importa automáticamente las carpetas de otro proyecto Docker.

## 2. Levantar todos los servicios

```sh
docker compose up --build -d
```

El proceso hace lo siguiente:

1. Inicia CouchDB y espera su comprobación de salud.
2. El frontend crea las bases e índices que falten.
3. Si la instalación está vacía, reserva el proceso de instalación, crea las credenciales y prepara la configuración y los datos de prueba elegidos.
4. Publica la política de acceso con una cuenta activa que combina administrador y director editorial de todos los módulos y secciones.
5. Registra `system.bootstrap` y marca la instalación como completada.
6. Solo entonces abre el servidor del frontend. Nginx espera a que el frontend esté saludable.

Puedes revisar el estado y el resultado sin mostrar las contraseñas:

```sh
docker compose ps -a
docker compose logs --tail=80 frontend
docker compose logs --tail=80 couchdb
```

El log del inicializador muestra un resumen como:

```json
{"status":"initialized","administratorCreated":true,"demoSeeded":true}
```

Si hay un fallo de inicialización, el servidor no abre su puerto HTTP. Corrige la configuración y vuelve a crear el frontend:

```sh
docker compose up -d --force-recreate frontend nginx
```

## 3. Entrar al sistema

- Sitio: `http://localhost:8081`.
- Login: `http://localhost:8081/login`.
- Panel: `http://localhost:8081/admin`.
- CouchDB/Fauxton, para administración técnica: `http://localhost:5985/_utils/`.

Inicia sesión con `CIMU_ADMIN_EMAIL` y la contraseña que definiste en `CIMU_ADMIN_PASSWORD`. La cuenta queda lista para entrar, sin un enlace de activación inicial. Desde Cuentas y permisos puedes invitar a las demás personas mediante enlaces individuales.

Si otro proyecto ya ocupa esos puertos, cambia `CIMU_HTTP_PORT` y `COUCHDB_PORT` en `.env`, por ejemplo a `18081` y `15985`. Después utiliza esos nuevos puertos en las URLs. Los puertos internos entre contenedores siguen siendo 4321 y 5984.

La configuración incluida publica los servicios únicamente en la interfaz local `127.0.0.1`. Para un servidor público, configurar dominio, HTTPS y proxy de forma deliberada; las cookies de producción usan `Secure`. Este Compose sirve como instalación local reproducible y no configura certificados TLS.

## 4. Datos de prueba opcionales

`CIMU_SEED_DEMO=true` en el primer arranque crea:

| Datos | Cantidad y estado |
| --- | --- |
| Cuenta de acceso | Una cuenta administradora/directora, con el correo y la contraseña definidos por quien instala. No se crean usuarios adicionales con contraseñas compartidas. |
| Autor de Gaceta | Un perfil ficticio activo. No es una cuenta de login. |
| Investigador | Un perfil ficticio relacionado con el catálogo. |
| Noticias | Una por sección: Actualidad y Vida universitaria publicadas; Opinión en borrador; Memoria aprobada; Audiovisuales en revisión. |
| Libros | Un libro publicado y otro en borrador. |
| Investigación | Una publicada. |
| Carrusel | Una imagen de demostración. |
| Configuración | Colección Demostración, publicación de portada y selección de destacadas. |
| Archivos | Una portada SVG propia y un PDF de una página con contenido ficticio, bajo `/uploads/demo/`. |

Los títulos del contenido editorial empiezan por `[DEMO]` y los registros tienen `demo: true`. Las imágenes y el PDF son recursos públicos de demostración; no representan un ejemplo de archivo confidencial. Los archivos nuevos que se suban por el flujo editorial normal siguen utilizando `private_assets` y su autorización correspondiente.

Con `CIMU_SEED_DEMO=false`, se crea la cuenta, las bases y los tres documentos de configuración con listas vacías. No se carga contenido ficticio ni se crean los archivos demo.

**La opción se aplica solo durante la instalación inicial.** Cambiarla después no agrega, elimina ni vuelve a cargar contenido. Así, borrar o editar un ejemplo desde el panel no hace que reaparezca al reiniciar. Para una instalación vacía de otra persona, utiliza otro proyecto/volúmenes de Docker; no borres los datos de una instalación existente para volver a ejecutar ejemplos.

Antes de utilizar el sitio como catálogo real, archiva o sustituye las publicaciones ficticias y retira los recursos públicos demo que ya no quieras conservar. No se implementó una acción masiva que borre datos por tener `demo: true`.

## 5. Reinicios y protección de datos existentes

Cuando existe `users/security-policy`, el inicializador no crea otra cuenta administradora ni cambia su contraseña, roles o estado. Tampoco rellena de nuevo los ejemplos ni reemplaza portada, destacadas o colecciones. Puede crear bases e índices técnicos que falten, sin modificar documentos existentes.

El log habitual de los siguientes arranques es:

```json
{"status":"existing","administratorCreated":false,"demoSeeded":false}
```

Por eso, cambiar `CIMU_ADMIN_PASSWORD` en `.env` después de instalar **no cambia** la contraseña de la cuenta. Para hacerlo, utiliza Mi cuenta o el restablecimiento de acceso del panel. El usuario existente tampoco se sustituye si cambias `CIMU_ADMIN_EMAIL`.

Los datos se conservan en volúmenes de CouchDB, archivos públicos y archivos privados. `docker compose down` detiene los servicios conservando esos volúmenes. No uses la eliminación de volúmenes para una actualización normal.

La inicialización usa inserciones por ID y maneja conflictos de revisión: no actualiza un documento de negocio que ya exista. La política se publica después de preparar las credenciales y el contenido, para no habilitar una cuenta a mitad de la carga.

## 6. Recuperar una inicialización interrumpida

La nueva base `app_meta` contiene el documento `installation` con el identificador de instalación, ID de la primera cuenta, nombre/correo configurados, opción demo, fecha y estado `pending` o `completed`. No guarda la contraseña en texto ni sustituye la política de acceso.

Si falla la conexión o el almacenamiento durante la preparación:

1. Conserva los volúmenes y revisa el error del frontend.
2. Reutiliza el mismo correo, nombre, contraseña y opción demo de la instalación pendiente.
3. Vuelve a iniciar el frontend. El proceso conserva las credenciales y documentos ya escritos y continúa con los faltantes.

Si la credencial ya fue creada, no se reemplaza con una contraseña diferente para resolver el fallo. Si la política ya se publicó y solo falta la finalización, el siguiente arranque termina el registro de auditoría/marca de instalación sin volver a cargar contenido.

El identificador de `app_meta` coordina inicializaciones simultáneas. Una instalación completada no se convierte en una instalación vacía aunque alguien elimine manualmente su política: ese caso necesita una revisión/restauración, no generar otro administrador de forma automática.

## 7. Instalar sobre información anterior

Si hay documentos existentes pero falta la política de cuentas, el inicializador se detiene con una indicación para usar `access:migrate`. No transforma usuarios antiguos, no escoge un administrador y no carga ejemplos sobre esa información.

Seguir el [procedimiento de migración](operacion-accesos.md), que contempla respaldo, revisión y adaptación explícita de las cuentas y estados anteriores. Una vez migrado, el arranque reconoce la política existente y conserva la instalación.

Esta separación es intencional:

- `db:setup`: instalación nueva; también se puede reanudar.
- `access:migrate`: adaptación de una instalación anterior, con simulación previa.
- `auth:cleanup`: mantenimiento de sesiones e intentos vencidos.

## 8. Usarlo sin Docker o en un Compose anterior

Con Node compatible, dependencias instaladas y CouchDB disponible, configura las variables `COUCHDB_*` y `CIMU_ADMIN_*`. Ejecuta:

```sh
npm run db:setup
npm run build
npm start
```

`db:setup` escribe los datos de inicialización; no es una simulación. No modifica una política existente.

Para que `npm start` haga la comprobación automáticamente, usa `CIMU_BOOTSTRAP=true`. Con `CIMU_BOOTSTRAP=false` o sin esa variable fuera de Compose, `npm start` inicia la aplicación sin ejecutar el inicializador. El archivo de ejemplo la activa. Después de preparar un despliegue con credenciales de base de datos restringidas, se puede desactivar esta tarea y reservar la creación de bases para mantenimiento autorizado.

Si conservas el proyecto externo `Cimu-docker`, su Dockerfile anterior ejecutaba directamente `dist/server/entry.mjs`. Para habilitar este flujo, debe copiar los directorios `scripts` (incluidos los fixtures) y `src/lib`, ejecutar `node scripts/start.mjs`, pasar las variables nuevas al frontend y esperar a CouchDB. El Compose incluido en este repositorio ya contiene esa integración. No mezcles volúmenes nuevos con los del despliegue anterior sin un plan de traslado.

## 9. Verificación de la instalación

Después del primer inicio:

1. Abrir `/login` e ingresar con la cuenta configurada.
2. Confirmar acceso a Cuentas y permisos, Gaceta, Libros e Investigaciones.
3. Si se activó demo, abrir Gaceta y un libro público; comprobar la portada y el PDF de ejemplo.
4. Verificar que el contenido en borrador no aparezca públicamente.
5. Reiniciar los servicios y comprobar que no se dupliquen la cuenta o los registros.

Las pruebas automatizadas cubren instalación vacía, rechazo de datos anteriores, configuración inválida, reanudación tras un fallo, arranques simultáneos, preservación de contraseñas/documentos y login HTTP con la cuenta inicial.

Referencias de infraestructura: [orden de arranque y salud de Docker Compose](https://docs.docker.com/compose/how-tos/startup-order/) y [configuración de CouchDB de un solo nodo](https://docs.couchdb.org/en/stable/setup/single-node.html).
