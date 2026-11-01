# Roadmap de lectura y primer arranque de CIMU

Revisión: 28 de octubre de 2026. Punto de entrada para personas nuevas en el proyecto.

El objetivo de esta ruta es que primero puedas abrir el sistema, después entender su uso y finalmente profundizar en su mantenimiento. No necesitas leer todos los documentos antes de iniciar una instalación local de prueba.

## 1. Elige tu ruta

| Tu objetivo | Ruta que debes seguir |
| --- | --- |
| Conocer el sistema y levantarlo completo sin modificar código | Sigue el apartado 3 de esta guía: Docker con base, aplicación y Nginx. No necesitas Node instalado en tu equipo. |
| Modificar la interfaz o el código | Sigue el apartado 4: Node local con recarga y CouchDB en Docker. |
| Usar el panel como personal editorial | Solicita una cuenta individual y lee el manual de roles; no necesitas instalar servicios en tu equipo. |
| Recibirlo y desplegarlo en servidores universitarios | Sigue el apartado 6 y el manual de producción completo, preparando primero preproducción. |
| Continuar una instalación con datos anteriores | Lee primero operación de accesos y sus pasos de migración. No sigas el procedimiento de base vacía sobre esos datos. |

## 2. Orden de lectura recomendado

| Orden | Documento | Qué leer y para qué | Resultado esperado |
| --- | --- | --- | --- |
| 1 | [README](../README.md) | Presentación, tecnologías y ubicación de la documentación. | Reconocer el proyecto y su carpeta raíz. |
| 2 | **Esta guía** | Elegir ruta y seguir el primer arranque correspondiente. | Saber qué comandos ejecutar y dónde entrar. |
| 3 | [Instalación inicial](instalacion-inicial.md) | Cuenta inicial, ejemplos opcionales, persistencia y reanudación. | Entender qué escribe el inicializador y qué conserva. |
| 4 | [Manual de desarrollo](manual-desarrollo.md) | Modalidad elegida, verificación, archivos y apagado. | Trabajar y repetir pruebas sin perder datos. |
| 5 | [Roles, permisos y flujo editorial](manual-roles-permisos.md) | Roles, matrices, estados y ejemplos de trabajo. | Crear cuentas con alcances apropiados y probar el flujo editorial. |
| 6 | [Interfaz administrativa](interfaz-admin.md) | Tablas, fichas, acciones de estado y Mi cuenta. | Reconocer las pantallas y el comportamiento de los módulos. |
| 7 | [Estructura de datos, login y auditoría](estructura-base-datos.md) | Bases, documentos, relaciones, archivos y eventos. | Comprender cómo se guardan datos y se interpretan los logs. |
| 8 | [Operación de accesos](operacion-accesos.md) | Migración, sesiones, mantenimiento y limitaciones. | Preparar cambios sobre una instalación existente. |
| 9 | [Manual de producción](manual-produccion.md) | Leer completo si se participa en el despliegue institucional. | Preparar HTTPS, secretos, persistencia, respaldo y recuperación. |
| 10 | [Estado de la documentación](estado-documentacion.md) | Cobertura y pendientes de entrega. | Identificar qué necesita completar el proyecto con la universidad. |

El [plan original de roles](plan-roles-permisos.md) sirve como contexto de diseño. Para conocer el comportamiento vigente, utiliza los manuales de roles, operación y datos; el plan no es una instrucción de instalación.

## 3. Ruta A: primer arranque completo con Docker

Esta es la ruta más directa para una persona nueva que quiere ver el sistema funcionando en su equipo. Se asume una instalación nueva y separada de otros proyectos.

### Paso A1. Tener las herramientas y el código

Necesitas Git, Docker funcionando y el complemento Compose. Comprueba:

```sh
git --version
docker --version
docker compose version
```

Clona el repositorio desde la URL proporcionada por el equipo y entra en la carpeta que contiene `compose.yaml`, `package.json` y `.env.example`. La rama actual de trabajo es `update`; si vas a usarla:

```sh
git status --short
git switch update
```

Conserva cambios locales antes de cambiar de rama. Para una entrega formal, utiliza el commit o etiqueta que te indique el equipo, en lugar de asumir que cualquier versión de `update` es la aprobada.

### Paso A2. Preparar credenciales y puertos

```sh
cp -n .env.example .env
```

Edita `.env` con tus propios valores. Ejemplo de configuración:

```dotenv
COUCHDB_USER=cimu_service
COUCHDB_PASSWORD='REEMPLAZAR_POR_UN_SECRETO_PROPIO_DE_COUCHDB'
COUCHDB_PORT=5985
COUCHDB_URL=http://127.0.0.1:5985
CIMU_HTTP_PORT=8081

CIMU_ADMIN_EMAIL=administrador@example.test
CIMU_ADMIN_NAME='Administración de pruebas'
CIMU_ADMIN_PASSWORD='REEMPLAZAR_POR_OTRA_CONTRASEÑA_PROPIA'
CIMU_SEED_DEMO=true
CIMU_BOOTSTRAP=true
```

Los valores `REEMPLAZAR_...` son instrucciones, no contraseñas para copiar. Utiliza dos contraseñas distintas; la del panel requiere al menos 12 caracteres y un máximo de 72 bytes UTF-8. El correo debe ser el de tu cuenta de prueba o la persona responsable. El dominio `example.test` solo ilustra el formato; no se enviarán correos automáticamente.

La cuenta técnica de CouchDB y la cuenta del panel son diferentes. `.env` no se publica ni se comparte junto con el código. `CIMU_SEED_DEMO=true` agrega contenido ficticio solo en la primera instalación; utiliza `false` si quieres un catálogo vacío.

Si ya tienes un `.env`, `cp -n` lo conserva: revisa sus valores antes de continuar. Si los puertos están ocupados, elige otros; por ejemplo 18081 y 15985, cambiando también `COUCHDB_URL` a `http://127.0.0.1:15985` para scripts locales.

### Paso A3. Levantar los tres servicios

En esta ruta usaremos el nombre de proyecto **`cimu-local`** en todos los comandos:

```sh
docker compose -p cimu-local config --quiet
docker compose -p cimu-local up --build -d
docker compose -p cimu-local ps -a
docker compose -p cimu-local logs --tail=80 frontend
```

El nombre separa los volúmenes de otros proyectos. No cambia los puertos por sí solo. El README permite arrancar sin `-p`, utilizando el nombre base `cimu`; elige un nombre y mantenlo en las operaciones de esa instalación.

Secuencia esperada:

1. CouchDB inicia y alcanza estado saludable.
2. El frontend crea las bases e índices de aplicación.
3. En una instalación vacía crea configuración, cuenta administradora/directora y los ejemplos solicitados.
4. El frontend abre su servidor y alcanza estado saludable.
5. Nginx inicia y permite entrar al sitio por el puerto publicado.

No necesitas ejecutar además `npm run db:setup` en tu equipo para esta ruta: el contenedor lo gestiona mediante su arranque. La primera construcción puede tardar mientras descarga imágenes y dependencias.

### Paso A4. Abrir el sistema

Con los puertos del ejemplo:

| Uso | Dirección | Credenciales |
| --- | --- | --- |
| Sitio público | `http://localhost:8081` | No requiere cuenta para contenido público. |
| Inicio de sesión | `http://localhost:8081/login` | `CIMU_ADMIN_EMAIL` y la contraseña inicial del panel. |
| Panel | `http://localhost:8081/admin` | Cuenta del panel. |
| Fauxton, administración técnica de CouchDB | `http://localhost:5985/_utils/` | `COUCHDB_USER` y `COUCHDB_PASSWORD`. |

Usa las URLs con tus puertos si los cambiaste. Estos accesos HTTP son para prueba local; un despliegue público de la aplicación compilada requiere HTTPS.

### Paso A5. Comprobar que quedó listo

- Puedes iniciar sesión y abrir Cuentas y permisos, Gaceta, Libros e Investigaciones.
- Si activaste demo, aparecen ejemplos identificados con `[DEMO]`, con recursos de prueba.
- Un contenido en borrador no aparece en la consulta pública.
- Puedes cerrar sesión y volver a entrar con la misma cuenta.
- Al reiniciar, no se duplican la cuenta ni las publicaciones de prueba.

Después lee el [manual de roles](manual-roles-permisos.md) para crear una segunda cuenta con permisos limitados y probar un flujo completo. No utilices una misma cuenta administrativa para todas las personas.

### Paso A6. Detener, volver a iniciar y actualizar

Detener conservando contenedores y volúmenes:

```sh
docker compose -p cimu-local stop
```

Volver a levantar:

```sh
docker compose -p cimu-local up -d
```

Después de actualizar el código del frontend:

```sh
docker compose -p cimu-local up --build -d frontend nginx
```

Retirar los contenedores conservando los volúmenes:

```sh
docker compose -p cimu-local down
```

No añadir `-v` ni `--volumes` a un apagado normal. Un `restart` no reconstruye la imagen con cambios de código. Cambiar las variables `CIMU_ADMIN_*` después de instalar no modifica la cuenta existente; utiliza Mi cuenta o restablecimiento desde administración.

### Ejemplo Compose: instalación local completa

El siguiente bloque reproduce `compose.yaml` en la revisión de esta guía. **Ya existe en la raíz: no necesitas crear otro archivo ni copiarlo en una subcarpeta.** Para futuras versiones, el archivo del repositorio es la referencia ejecutable.

Se usa con `docker/Dockerfile`, `docker/nginx.conf` y `docker/couchdb.ini`; un YAML aislado sin esos archivos no constituye la instalación completa.

```yaml
name: cimu
services:
  couchdb:
    image: couchdb:3
    user: "5984:5984"
    environment:
      COUCHDB_USER: ${COUCHDB_USER:-cimu_service}
      COUCHDB_PASSWORD: ${COUCHDB_PASSWORD:?Define COUCHDB_PASSWORD en .env}
      NODENAME: 127.0.0.1
    volumes:
      - couchdb_data:/opt/couchdb/data
      - ./docker/couchdb.ini:/opt/couchdb/etc/local.d/10-single-node.ini:ro
    ports:
      - "127.0.0.1:${COUCHDB_PORT:-5985}:5984"
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://127.0.0.1:5984/_up"]
      interval: 5s
      timeout: 3s
      retries: 20
    logging: &logging
      driver: json-file
      options:
        max-size: 10m
        max-file: "3"
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      HOST: 0.0.0.0
      PORT: 4321
      COUCHDB_URL: http://couchdb:5984
      COUCHDB_USER: ${COUCHDB_USER:-cimu_service}
      COUCHDB_PASSWORD: ${COUCHDB_PASSWORD:?Define COUCHDB_PASSWORD en .env}
      CIMU_BOOTSTRAP: ${CIMU_BOOTSTRAP:-true}
      CIMU_ADMIN_EMAIL: ${CIMU_ADMIN_EMAIL:-}
      CIMU_ADMIN_NAME: ${CIMU_ADMIN_NAME:-Administración CIMU}
      CIMU_ADMIN_PASSWORD: ${CIMU_ADMIN_PASSWORD:-}
      CIMU_SEED_DEMO: ${CIMU_SEED_DEMO:-false}
      PRIVATE_UPLOAD_DIR: /app/storage/private
    volumes:
      - public_uploads:/app/public/uploads
      - private_uploads:/app/storage/private
    depends_on:
      couchdb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:4321/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 5s
      timeout: 5s
      retries: 30
      start_period: 20s
    logging: *logging
  nginx:
    image: nginx:alpine
    ports:
      - "127.0.0.1:${CIMU_HTTP_PORT:-8081}:80"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - public_uploads:/usr/share/nginx/html/uploads:ro
    depends_on:
      frontend:
        condition: service_healthy
    logging: *logging
volumes:
  couchdb_data:
  public_uploads:
  private_uploads:
```

Este Compose levanta tres servicios, no solamente la base. El frontend no publica directamente el 4321 al equipo; se entra mediante Nginx. Los volúmenes guardan por separado las bases, los archivos públicos y los privados.

## 4. Ruta B: desarrollar con recarga de cambios

Sigue el [manual de desarrollo](manual-desarrollo.md) para los requisitos completos. Esta ruta utiliza **`cimu-dev`**, separado de `cimu-local`.

1. Instala Node 22, al menos 22.16, y npm.
2. En `.env`, usa `COUCHDB_PORT=15985`, `COUCHDB_URL=http://127.0.0.1:15985` y `CIMU_HTTP_PORT=18081`. Define también las credenciales y la opción demo como en el paso A2.
3. Levanta solo la base y espera a que esté saludable:

```sh
docker compose -p cimu-dev up -d couchdb
docker compose -p cimu-dev ps -a
```

4. Instala dependencias, prepara la base y abre el servidor de desarrollo:

```sh
npm ci
npm run db:setup
npm run dev
```

5. Abre `http://localhost:4321/login` o la dirección que indique Astro en la terminal.
6. Antes de entregar cambios, ejecuta:

```sh
npm test
npm run test:integration
```

La integración ya construye el proyecto. Para esta modalidad no necesitas otro Compose: seleccionar `couchdb` del archivo raíz inicia solamente ese servicio. `db:setup` sí escribe la inicialización; `npm run dev` no la ejecuta automáticamente.

En esta ruta, los archivos están en `public/uploads` y `storage/private` del repositorio; en la ruta A están en volúmenes Docker. Mantén ambas bases separadas. Si quieres trasladar una instalación entre modalidades, debes mover también los archivos que sus documentos referencian.

## 5. Si ya existe información: ruta de migración

Antes de cualquier cambio, lee [Preparación y migración](operacion-accesos.md#preparación-y-migración). Respalda bases y archivos y trabaja primero con una copia.

- Política de acceso ya creada: el inicializador la conserva y no vuelve a crear la cuenta.
- Datos antiguos sin política: el inicializador se detiene y requiere el procedimiento de migración.
- Instalación interrumpida: conserva volúmenes y configuración y sigue la reanudación descrita en instalación inicial.

Si continúas con el proyecto externo `Cimu-docker`, utiliza su inventario de volúmenes y configuración real. El Compose de este repositorio no importa automáticamente sus datos. No levantes una base vacía y asumas que contiene la información del despliegue anterior.

## 6. Ruta C: entrega y producción en la universidad

Esta ruta corresponde al equipo de servidores. Orden recomendado:

1. Leer esta guía, [instalación inicial](instalacion-inicial.md) y [estructura de datos](estructura-base-datos.md).
2. Leer completo el [manual de producción](manual-produccion.md).
3. Identificar la versión, decidir instalación vacía o traslado y preparar preproducción separada.
4. Definir dominio, TLS, red, almacenamiento, secretos y responsables.
5. Preparar el proxy de producción y su Compose adicional.
6. Configurar `CIMU_SEED_DEMO=false` **antes del primer arranque** y las credenciales iniciales privadas.
7. Levantar, probar login/roles/archivos, realizar respaldo y comprobar restauración.
8. Registrar aceptación y habilitar el servicio según el procedimiento institucional.

### Ejemplo Compose adicional para producción

Este archivo **complementa** `compose.yaml`; no funciona solo y no instala certificados ni un proxy TLS institucional. Su preparación y la de `docker/nginx.production.conf` se explican en el apartado 4 del manual de producción.

Crear `compose.production.yaml` en la raíz cuando el equipo de servidores haya preparado esa configuración:

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

Preparar `.env.production` desde el ejemplo, con secretos propios y `CIMU_SEED_DEMO=false`. Luego, para la arquitectura documentada:

```sh
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml config --quiet
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml up --build -d
docker compose --env-file .env.production -p cimu-prod -f compose.yaml -f compose.production.yaml ps -a
```

El archivo local de Nginx reenvía el protocolo HTTP de su conexión. Para colocarlo detrás de HTTPS se debe adaptar como indica el manual; no basta con añadir un certificado en otro proxy y conservar toda la cadena sin revisión. La URL final será el dominio institucional HTTPS, no el `localhost` del equipo del usuario.

## 7. Dónde buscar ayuda durante el recorrido

| Situación | Dónde continuar |
| --- | --- |
| Solo está funcionando CouchDB y no abre la web | Verificar `ps -a`; la ruta A necesita también frontend y Nginx. |
| Puerto ocupado o servicios que no arrancan | Manual de desarrollo, problemas frecuentes, y logs del proyecto correspondiente. |
| El instalador pide migración o quedó pendiente | Guía de instalación inicial, apartados de datos anteriores y reanudación. |
| No aparecen acciones de publicar o archivar | Manual de roles: revisar rol, módulo, sección y estado. |
| Cambiaste variables pero la contraseña sigue igual | Instalación inicial: las variables iniciales no restablecen cuentas. |
| No aparecen recursos después de trasladar la base | Revisar también archivos públicos/privados y sus volúmenes. |
| Login falla detrás del dominio HTTPS | Manual de producción: protocolo, host, cookies y cadena de proxies. |
| Necesitas saber quién realizó una operación | Estructura de datos: diccionario e interpretación de auditoría. |
| Necesitas preparar la entrega documental | Estado de la documentación y pendientes de entrega. |

Una vez completada tu ruta, registra qué versión utilizaste, qué nombre de proyecto y puertos elegiste y dónde están sus datos. Conserva las credenciales en el mecanismo privado del equipo, no en ese registro de lectura.
