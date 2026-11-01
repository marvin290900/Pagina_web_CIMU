# Manual de despliegue y operación en producción

Proyecto: CIMU · Editorial y Gaceta. Revisión: 28 de octubre de 2026.

El [roadmap de lectura](roadmap-lectura.md) ofrece el recorrido inicial y distingue instalación local, desarrollo y recepción institucional. Este manual detalla la ruta de producción.

Documento de entrega al equipo de desarrollo e infraestructura de la Universidad de El Salvador encargado de servidores. Describe el comportamiento del repositorio y una arquitectura de referencia para su adaptación institucional. No acredita un despliegue público ni una configuración TLS ya instalada.

Los comandos se ejecutan desde la raíz del repositorio. El despliegue local incluido utiliza Docker Compose, Astro SSR con Node, Nginx y CouchDB de un solo nodo. La universidad puede integrarlo con su plataforma de contenedores conservando los requisitos de red, persistencia, inicialización y autenticación aquí indicados.

## 1. Responsabilidades y datos de entrega

| Responsable | Tareas |
| --- | --- |
| Equipo del proyecto | Entregar código versionado, pruebas, documentación, requisitos de migración y soporte funcional. |
| Equipo de servidores de la universidad | Aprovisionar infraestructura, dominio, TLS, redes, secretos, almacenamiento, respaldos, monitoreo, despliegues y restauraciones. |
| Administración editorial | Definir quién tendrá cada rol, administrar cuentas individuales y validar publicaciones y flujos. |

Antes de desplegar, completar el registro de instalación:

| Dato | Valor institucional por definir |
| --- | --- |
| Dominio y URL pública HTTPS | ____________________ |
| Servidor/plataforma y entorno de preproducción | ____________________ |
| Commit o etiqueta e identificadores de imágenes | ____________________ |
| Ruta de despliegue y nombre de proyecto | ____________________ |
| Responsable técnico y canal de incidentes | ____________________ |
| Persona responsable de la primera cuenta del panel | ____________________ |
| Ubicación protegida de secretos y respaldos | ____________________ |
| Pérdida de datos tolerable y tiempo objetivo de recuperación | ____________________ |
| Frecuencia, retención y fecha de prueba de restauración | ____________________ |

No hay dimensionamiento de carga certificado. Asignar CPU, memoria y disco según catálogo, tamaño de archivos, concurrencia y crecimiento observados en preproducción. La solución incluida no implementa un clúster CouchDB ni alta disponibilidad.

## 2. Arquitectura y puertos

Arquitectura de referencia para un único servidor:

```text
Navegador
   │ HTTPS 443, dominio institucional
   ▼
Proxy TLS institucional, en el mismo servidor
   │ HTTP a 127.0.0.1:8081
   ▼
Nginx de CIMU ──────────────► archivos públicos /uploads/
   │ red Docker, frontend:4321
   ▼
Astro / Node ──────────────► volumen privado, autorizado por /api/archivos/...
   │ red Docker, couchdb:5984
   ▼
CouchDB ──────────────────► volumen persistente de bases
```

| Servicio | Puerto interno | Publicación en el Compose base |
| --- | --- | --- |
| Nginx CIMU | 80 | `127.0.0.1:8081`, configurable mediante `CIMU_HTTP_PORT`. |
| Aplicación | 4321 | Sin publicación al host. |
| CouchDB | 5984 | `127.0.0.1:5985`, configurable mediante `COUCHDB_PORT`. |
| Proxy institucional | Depende de la plataforma | HTTPS 443; HTTP 80 puede redirigir a HTTPS. No está incluido. |

CouchDB/Fauxton no debe publicarse como servicio abierto en Internet. El acceso técnico puede realizarse desde el servidor o por el mecanismo de administración restringido de la universidad. Si el proxy institucional está en otro servidor o contenedor, `127.0.0.1` no lo conecta al host de CIMU: adaptar la red y restringir el origen autorizado de manera explícita.

Los archivos privados nunca deben montarse bajo una raíz web ni un alias de Nginx. La aplicación entrega los archivos de publicaciones según su estado y los permisos del solicitante.

## 3. Preparar código, imágenes y secretos

Desplegar una versión identificada por commit o etiqueta. La rama de trabajo actual es `update`; su nombre por sí solo no identifica una entrega inmutable. Registrar el resultado de:

```sh
git rev-parse HEAD
docker compose version
```

El Dockerfile usa Node 22, `npm ci`, una compilación de Astro y un usuario Node sin privilegios para ejecutar el servidor. Incluye Poppler. El comando de arranque es `node scripts/start.mjs`; ejecutar directamente `dist/server/entry.mjs` omitiría el inicializador.

Los tags actuales `node:22-alpine`, `couchdb:3` y `nginx:alpine` pueden cambiar con el tiempo. Para una entrega reproducible, el equipo de servidores debe aprobar versiones/digests y registrar la imagen construida, idealmente en su registro institucional. No actualizar la imagen de CouchDB sin revisar compatibilidad y procedimiento de actualización de su versión.

Crear el archivo de entorno fuera de publicaciones web y limitar su lectura:

```sh
cp -n .env.example .env.production
chmod 600 .env.production
```

Este nombre separa la configuración de la del desarrollador. Los comandos siguientes lo seleccionan expresamente; no se carga automáticamente como `.env`.

| Variable | Valor o finalidad en producción |
| --- | --- |
| `COUCHDB_USER` | Cuenta técnica; en el Compose actual configura también el administrador del servidor CouchDB. Ver apartado 7. |
| `COUCHDB_PASSWORD` | Secreto propio de CouchDB, diferente del acceso editorial. |
| `COUCHDB_PORT` | Puerto técnico local libre; referencia: `5985`. |
| `CIMU_HTTP_PORT` | Puerto local al que accederá el proxy institucional; referencia: `8081`. |
| `CIMU_ADMIN_EMAIL` | Correo de la persona responsable de la cuenta inicial del panel. |
| `CIMU_ADMIN_NAME` | Nombre identificable de esa persona. |
| `CIMU_ADMIN_PASSWORD` | Contraseña inicial privada: al menos 12 caracteres, máximo 72 bytes UTF-8. |
| `CIMU_SEED_DEMO` | **`false` antes del primer arranque de producción.** |
| `CIMU_BOOTSTRAP` | `true` para preparar una instalación nueva; consultar el apartado 7 para separar inicialización y operación. |
| `COUCHDB_URL` | El Compose asigna al frontend `http://couchdb:5984`. La URL del ejemplo sirve para scripts ejecutados fuera de Docker. |
| `PRIVATE_UPLOAD_DIR` | El Compose fija `/app/storage/private`, respaldado por el volumen privado. |

No hay una contraseña predeterminada. Las variables iniciales no restablecen un administrador existente. Poner `CIMU_SEED_DEMO=false` después de instalar no elimina ejemplos que ya se hubieran creado.

La aplicación consume estas variables de entorno; no implementa variables `*_FILE`. Si la universidad usa un gestor de secretos o archivos montados, debe integrar su inyección al proceso. No basta con agregar un sufijo `_FILE` al nombre de una variable.

## 4. Configurar HTTPS y la cadena de proxies

Este paso se completa y valida en preproducción antes de habilitar usuarios. La aplicación compilada utiliza cookies `Secure` y valida el origen de las escrituras. El navegador debe acceder mediante el mismo dominio HTTPS tanto a páginas como a APIs.

**Ajuste necesario del archivo incluido:** `docker/nginx.conf` establece `X-Forwarded-Proto $scheme`. Si otro proxy termina HTTPS y entrega HTTP a ese Nginx, el valor resultante será `http`. Debe adaptarse para que Astro reciba el protocolo y host públicos correctos.

Para la arquitectura de un único servidor del apartado 2, se puede usar esta configuración de referencia. Reemplazar `editorial.universidad.example` y las rutas de certificados por los valores aprobados; son marcadores, no el dominio real de la universidad.

### 4.1. Proxy TLS institucional

Ejemplo para Nginx del host, fuera de Docker:

```nginx
server {
    listen 80;
    server_name editorial.universidad.example;
    return 301 https://editorial.universidad.example$request_uri;
}

server {
    listen 443 ssl;
    server_name editorial.universidad.example;
    ssl_certificate /RUTA_INSTITUCIONAL/certificado.pem;
    ssl_certificate_key /RUTA_INSTITUCIONAL/clave.pem;
    client_max_body_size 55m;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host editorial.universidad.example;
        proxy_set_header X-Forwarded-Host editorial.universidad.example;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Port 443;
    }
}
```

El proxy de entrada sustituye las cabeceras que podría enviar el visitante. El equipo de servidores debe añadir su política TLS, renovación, manejo de hosts desconocidos y observabilidad habituales. Si hay un balanceador adicional, adaptar la cadena de IPs confiables; el ejemplo supone conexión directa del navegador a este proxy.

### 4.2. Nginx interno de CIMU

Copiar `docker/nginx.conf` a `docker/nginx.production.conf`. En la copia, dentro de `location /`, cambiar/agregar:

```nginx
proxy_set_header X-Forwarded-Proto https;
proxy_set_header X-Forwarded-Host $http_host;
proxy_set_header X-Forwarded-Port 443;
proxy_set_header X-Forwarded-For $http_x_forwarded_for;
proxy_set_header X-Real-IP $http_x_real_ip;
```

Conservar `proxy_set_header Host $http_host`, el resto del proxy y el alias de archivos públicos. El protocolo fijo `https` corresponde exclusivamente a este origen que recibe tráfico del proxy TLS; no sirve para una entrada que mezcle orígenes HTTP y HTTPS.

Las cabeceras de IP aquí se aceptan del proxy anterior que las saneó. Esta configuración requiere mantener el puerto 8081 restringido al proxy de confianza. No sustituirlo por una publicación abierta en `0.0.0.0`. En infraestructuras distintas, el equipo de servidores debe establecer sus redes y proxies confiables antes de adoptar estas directivas.

Crear `compose.production.yaml` como adaptación institucional; no viene creado automáticamente:

```yaml
services:
  couchdb:
    restart: unless-stopped
  frontend:
    restart: unless-stopped
  nginx:
    restart: unless-stopped
    volumes:
      - ./docker/nginx.production.conf:/etc/nginx/conf.d/default.conf:ro
```

Compose combina los montajes por su ruta de destino: este reemplaza el archivo de configuración y conserva el volumen público. El archivo adicional también es el lugar para fijar las imágenes aprobadas y los ajustes institucionales. Conservar ambas configuraciones junto con el registro de despliegue, sin secretos en el repositorio.

La alternativa es integrar directamente la aplicación y sus recursos en el proxy/plataforma institucional; requiere una configuración equivalente. No desactivar la validación de origen ni eliminar `Secure` para resolver un problema de proxy.

## 5. Primer despliegue: instalación vacía

Ejecutar primero las pruebas de la entrega en desarrollo o CI:

```sh
npm ci
npm test
npm run test:integration
```

El servidor de destino no necesita Node instalado si construye/ejecuta imágenes Docker. Los comandos de npm anteriores corresponden al equipo o proceso que verifica la entrega.

Una vez preparados entorno, configuración de producción y TLS, validar la composición sin imprimir los valores de secretos:

```sh
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml config --quiet
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml build frontend
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml up -d
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml ps -a
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml logs --tail=80 frontend
```

Si la plataforma recibe una imagen ya construida, sustituir `build` por su procedimiento de descarga y referencia de imagen aprobada. Mantener el nombre de proyecto y los archivos de configuración en todas las operaciones: cambiarlos puede crear otros volúmenes y simular una instalación vacía.

La inicialización espera a CouchDB, crea las 18 bases de aplicación e índices y prepara configuración y credenciales. Publica la política de acceso y registra `system.bootstrap`; el documento `app_meta/installation` queda `completed`. El administrador inicial combina administración de cuentas y dirección editorial de todos los módulos/secciones.

Con `CIMU_SEED_DEMO=false` el catálogo empieza vacío. No hay que crear las bases manualmente ni insertar un usuario mediante Fauxton.

Los siguientes arranques preservan la cuenta y los documentos existentes. Si la instalación se interrumpe, conservar volúmenes y valores iniciales y seguir la [reanudación del inicializador](instalacion-inicial.md#6-recuperar-una-inicialización-interrumpida). No borrar `security-policy` ni `app_meta` para intentar crear otra cuenta.

## 6. Traslado de una instalación existente

No tratar una base existente como una instalación vacía. Antes de habilitar escrituras:

1. Inventariar versión anterior, bases, cuentas, URLs de archivos y almacenamiento público/privado.
2. Respaldar el conjunto y restaurarlo en preproducción aislada.
3. Si falta la nueva política de acceso, ejecutar primero la simulación de migración y revisar sus resultados según [Operación de cuentas y permisos](operacion-accesos.md#preparación-y-migración).
4. Confirmar el significado de los estados históricos antes de aplicar la conversión. La opción `--legacy-active-is-published` exige esa revisión.
5. Probar cuentas, permisos, archivos y publicaciones con la versión nueva.
6. Acordar una ventana, detener las escrituras anteriores y realizar el traslado definitivo de bases y archivos del mismo corte.
7. Habilitar una sola versión de la aplicación sobre esos datos y ejecutar la aceptación del apartado 8.

El Compose nuevo no importa automáticamente las carpetas ni los volúmenes del despliegue externo `Cimu-docker`. Identificar y trasladar esos datos expresamente. `docker compose down` sin eliminación de volúmenes conserva los volúmenes nombrados del proyecto, pero no los conecta a otro proyecto por sí solo.

Los recursos históricos en `/uploads/` siguen siendo públicos por su URL. Archivar un documento no retira esas copias físicas anteriores; su traslado a almacenamiento privado requiere inventario y adaptación de referencias. La autorización implementada para archivos nuevos pasa por `/api/archivos/`.

## 7. Cuentas técnicas y operación después de inicializar

Hay dos niveles diferentes de administración:

| Nivel | Administración |
| --- | --- |
| Infraestructura/CouchDB | Secretos del servidor, permisos sobre bases, respaldos y mantenimiento. Responsabilidad técnica de la universidad. |
| Panel CIMU | Cuentas personales, roles y alcances editoriales. Responsabilidad de administración editorial. |

**Situación actual del Compose:** utiliza `COUCHDB_USER` y `COUCHDB_PASSWORD` tanto para crear el administrador de CouchDB como para la conexión del frontend. Todavía no separa automáticamente una cuenta CouchDB de inicialización y otra de ejecución restringida.

Para adoptar mínimo privilegio, el equipo técnico debe:

1. Ejecutar inicialización/migraciones con una cuenta autorizada para crear bases e índices.
2. Aprovisionar una cuenta técnica distinta y configurar `_security` en todas las bases de aplicación, con los permisos de lectura y escritura que requieran sesiones, cuentas, contenido y auditoría.
3. Adaptar el entorno del servicio frontend para usar esa cuenta, manteniendo por separado las credenciales administrativas del servicio CouchDB.
4. Desactivar `CIMU_BOOTSTRAP` en el frontend operativo, recrearlo y verificar los flujos completos.
5. Reservar los cambios de esquema/índices para tareas de mantenimiento con la cuenta adecuada.

Cambiar solo `CIMU_BOOTSTRAP=false` no restringe una cuenta administradora existente. Cambiar solo las variables compartidas del Compose tampoco crea esta separación. La adaptación institucional debe documentar sus nombres de secretos y procedimiento de ejecución.

Después del primer acceso, la persona responsable debe cambiar su contraseña desde Mi cuenta. Administrar al menos dos cuentas personales con permiso de administración evita depender de una única persona. Los enlaces de activación/restablecimiento se entregan por un canal privado: no hay proveedor de correo ni recuperación pública automática configurados.

Con la instalación completada, retirar el secreto inicial del panel de la configuración operativa cuando ya no se necesite para una inicialización pendiente. No confundirlo con el secreto de CouchDB que la aplicación sigue utilizando.

## 8. Aceptación antes de abrir el servicio

Registrar responsable, fecha, versión y resultado:

- El dominio resuelve al ingreso institucional, presenta un certificado válido y redirige HTTP a HTTPS.
- CouchDB y frontend aparecen saludables. El frontend tiene comprobación sobre `/login`, no una prueba completa de todas las operaciones de base y archivos.
- Se puede iniciar y cerrar sesión por el dominio HTTPS; la cookie es `HttpOnly`, `Secure` y `SameSite=Lax`.
- Los formularios funcionan sin errores de origen. Verificar dominio, protocolo y puerto si aparece un 403.
- Las cabeceras de IP se obtienen de la cadena de proxies autorizada, no del valor arbitrario enviado por el visitante.
- La cuenta inicial entra al panel y puede crear cuentas con alcances limitados; estas no acceden a módulos ni secciones ajenos.
- Un borrador no aparece públicamente; un contenido aprobado puede publicarse con dirección editorial.
- Un archivo nuevo asociado a borrador no se puede descargar sin autorización; al publicar funciona y al retirar vuelve a restringirse.
- Carrusel, portadas y descargas públicas conservan sus recursos después de recrear el frontend.
- Aparecen los eventos de actividad esperados y no hay ejemplos ficticios en el catálogo productivo.
- Existe un respaldo externo al servidor y se completó una restauración de prueba en otro entorno.

No abrir el servicio únicamente porque `/login` responda 200. Ejecutar las comprobaciones funcionales también con permisos limitados.

## 9. Persistencia y respaldos

| Recurso | Ubicación en contenedor | Requisito |
| --- | --- | --- |
| Bases y metadatos | CouchDB: `/opt/couchdb/data`, volumen `couchdb_data`. | Respaldar bases de aplicación y las bases de sistema necesarias para recuperar la instalación. |
| Recursos públicos | Frontend: `/app/public/uploads`, volumen `public_uploads`. Nginx lo monta en lectura. | Conservar archivos y rutas referenciadas por los documentos. |
| Recursos privados | Frontend: `/app/storage/private`, volumen `private_uploads`. | Respaldar junto con `private_assets` y contenidos asociados; mantener fuera de cualquier raíz pública. |
| Configuración y versión | Compose, configuración de proxies, imagen/commit y secretos bajo custodia. | Recuperar configuración compatible y secretos por separado, con acceso restringido. |

Los nombres reales de volumen incluyen el proyecto; identificarlos con el inventario de Docker antes de respaldar. CouchDB utiliza UID/GID 5984 y el frontend ejecuta como usuario `node`; conservar propietarios y permisos al restaurar. No resolver errores de escritura habilitando permisos universales.

El equipo de servidores debe elegir y automatizar una estrategia de copia/snapshot o replicación con retención independiente. Una réplica que propaga borrados no sustituye por sí sola un historial recuperable. CouchDB documenta sus [métodos de respaldo](https://docs.couchdb.org/en/stable/maintenance/backups.html); el conjunto de CIMU incluye además ambos volúmenes de archivos.

Procedimiento de referencia para un respaldo con parada:

1. Anunciar mantenimiento y bloquear nuevas solicitudes en el proxy institucional.
2. Detener Nginx y frontend para impedir escrituras desde CIMU.
3. Detener CouchDB de forma ordenada para una copia en frío de su almacenamiento.
4. Respaldar los tres volúmenes y la configuración/versiones del mismo corte con la herramienta institucional.
5. Guardar la copia fuera del servidor, verificar integridad y registrar su identificador y fecha.
6. Iniciar los servicios, verificar salud y flujos y reabrir el ingreso.

No presentar una copia de carpetas arbitrarias de un CouchDB activo como un respaldo consistente garantizado. Si se requiere operación sin parada, diseñar y comprobar el mecanismo de respaldo y coordinación con archivos. Definir frecuencia y retención según los objetivos acordados en el apartado 1.

## 10. Actualizaciones y vuelta a una versión anterior

Para cada entrega:

1. Validar código, migraciones y restauración en preproducción, usando copia controlada de los datos necesarios.
2. Registrar versión anterior, nueva, configuración y respaldo de retorno.
3. Preparar la imagen nueva antes de la ventana; no compilar ni actualizar dependencias sobre la aplicación en ejecución.
4. Bloquear el ingreso y detener escrituras; generar el respaldo del corte.
5. Ejecutar únicamente las migraciones revisadas para esa entrega. La inicialización repetible no sustituye cualquier migración futura.
6. Recrear frontend/proxy con la imagen aprobada, conservando volúmenes y nombre de proyecto.
7. Ejecutar aceptación y reabrir el ingreso; registrar el resultado.

El Compose incluido es una instalación de una sola instancia; no promete actualizaciones sin interrupción. No usar `down -v`, eliminar volúmenes o ejecutar `docker system prune --volumes` como parte de una actualización.

Si hay que retroceder, el equipo técnico debe comprobar primero la compatibilidad de la versión anterior con los datos actuales. Si la nueva versión transformó el esquema o documentos de forma incompatible, restaurar el conjunto coherente de bases, archivos y configuración del respaldo y la imagen anterior. Ese retorno puede perder las escrituras posteriores al corte; acordar cómo conciliarlas antes de reabrir.

## 11. Monitoreo, logs y mantenimiento

Comandos de diagnóstico del despliegue de referencia:

```sh
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml ps -a
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml logs --tail=100 frontend nginx couchdb
```

El Compose limita los logs de cada contenedor a archivos de 10 MB, hasta tres. Esa rotación no respalda ni limita `audit_events`, que es una base distinta. El panel muestra las últimas 100 operaciones registradas; la base puede contener más. Definir retención y exportación según la operación institucional.

La auditoría cubre acciones implementadas explícitamente, no una grabación completa de solicitudes ni un registro inmutable. Para interpretar `actorId`, `action`, `resourceId`, fechas y detalles, utilizar el [diccionario de datos y eventos](estructura-base-datos.md). No compartir logs que contengan cookies, enlaces de activación, contraseñas o datos personales sin el tratamiento adecuado.

Monitorear al menos disponibilidad HTTPS, vencimiento TLS, errores HTTP, reinicios, salud de servicios, espacio libre y crecimiento de bases/archivos, además de éxito y antigüedad del respaldo. Un estado `unhealthy` no produce por sí solo una reparación automática completa; definir alertas y atención.

Limpieza de sesiones e intentos vencidos, dentro del frontend:

```sh
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml exec frontend npm run auth:cleanup
```

El comando anterior simula y muestra cantidades. Tras revisar el resultado, el mantenimiento puede aplicar:

```sh
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml exec frontend npm run auth:cleanup -- --apply
```

No elimina automáticamente la auditoría ni archivos huérfanos. No hay un programador de esta tarea instalado por el proyecto; su frecuencia pertenece a la operación institucional.

| Incidente | Acción inicial |
| --- | --- |
| Puerto ocupado | Identificar el proceso/proyecto dueño y adaptar el puerto; no detener servicios ajenos. |
| Frontend no inicia | Revisar logs, conexión a CouchDB, secretos, volumen y estado de inicialización. Conservar datos y reanudar según la guía. |
| Login funciona localmente pero falla en dominio | Revisar HTTPS, cookie, host/protocolo reenviados y origen de los formularios. |
| Acciones administrativas devuelven 401 | Reingresar: algunas acciones sensibles requieren una sesión iniciada hace menos de diez minutos. |
| 403 de permisos | Revisar roles, módulos y secciones; no conceder administración para ocultar una asignación incorrecta. |
| 409 al guardar | Revisar concurrencia y versión del documento; recargar antes de repetir. |
| 413 al subir archivos | Revisar límites de todos los proxies; la referencia usa 55 MB de cuerpo. La aplicación valida imágenes de hasta 10 MiB y PDF de hasta 50 MiB. |
| Archivo desaparecido | Revisar volumen, ruta y permisos y comprobar que base y archivos pertenecen al mismo respaldo. |

## 12. Restauración y recuperación

1. Declarar mantenimiento, cerrar el ingreso y registrar versión y causa del incidente.
2. Seleccionar un respaldo íntegro y compatible; conservar el estado afectado para diagnóstico cuando corresponda.
3. Preparar infraestructura aislada con la imagen/versiones de ese respaldo y sus secretos bajo custodia.
4. Restaurar bases, archivos públicos y privados, configuración y propietarios. Comprobar que no apunta a la base de otro entorno.
5. Iniciar los servicios. La política restaurada debe conservarse: no crear otro administrador borrándola ni ejecutar una instalación demo.
6. Validar login, roles, publicaciones, archivos, auditoría y funcionamiento HTTPS.
7. Si el incidente afectó credenciales, ejecutar la rotación/revocación necesaria; restaurar un respaldo no revoca automáticamente todas las sesiones restauradas.
8. Registrar el punto recuperado, pérdida de cambios, resultado y autorización operativa para reabrir el ingreso.

Realizar esta prueba periódicamente fuera de producción y registrar el tiempo real de recuperación. Tener un archivo de respaldo sin comprobar su restauración no demuestra que el sistema pueda recuperarse.

## 13. Documentos y referencias

- [Desarrollo](manual-desarrollo.md): entorno del equipo que modifica el código.
- [Inicialización](instalacion-inicial.md): contenido inicial, preservación y reanudación.
- [Roles y permisos](manual-roles-permisos.md): uso del panel y ejemplos editoriales.
- [Estructura de datos](estructura-base-datos.md): bases, login y auditoría.
- [Operación de accesos](operacion-accesos.md): migración y comportamiento de autenticación.
- [Docker Compose en producción](https://docs.docker.com/compose/how-tos/production/): adaptación de configuración por entorno.
- [Respaldos de CouchDB](https://docs.couchdb.org/en/stable/maintenance/backups.html): métodos y consideraciones de respaldo de bases.

Este manual requiere completar las decisiones institucionales del apartado 1 y probar la cadena HTTPS elegida con la versión entregada. La configuración TLS de referencia es una propuesta para el equipo de servidores; no ha sido aplicada a servidores de la universidad desde este proyecto.
