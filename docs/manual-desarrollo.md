# Manual de instalación y operación en desarrollo

Proyecto: CIMU · Editorial y Gaceta. Revisión: 28 de octubre de 2026.

Si acabas de incorporarte, comienza con el [roadmap de lectura y primer arranque](roadmap-lectura.md) para elegir modalidad y seguir los documentos en orden.

Dirigido al equipo que modifica y prueba el código. Para entregar el sistema a servidores, utilizar el [manual de producción](manual-produccion.md). Los comandos parten de la raíz del repositorio, donde están `package.json` y `compose.yaml`.

## 1. Elegir cómo trabajar

| Modalidad | Cuándo usarla | Acceso |
| --- | --- | --- |
| Node local y CouchDB en Docker | Desarrollo diario: los cambios de interfaz y código se recargan durante el trabajo. Es la modalidad recomendada en este manual. | `http://localhost:4321` |
| Todos los servicios en Docker | Comprobar la imagen compilada, el proxy y la inicialización conjunta. Requiere reconstruir la imagen después de cambiar código. | `http://localhost:18081`, con los puertos de ejemplo de este manual. |

Utilizar datos y credenciales de desarrollo. El nombre de proyecto Docker separa los volúmenes, pero no cambia por sí solo las conexiones configuradas en `.env`: comprobar siempre `COUCHDB_URL` antes de ejecutar scripts.

## 2. Requisitos y código

- Git.
- Node.js 22, al menos 22.16, y npm. El Dockerfile utiliza la línea Node 22.
- Docker Engine o Docker Desktop con el complemento `docker compose`.
- Acceso a los registros de imágenes y paquetes para la primera instalación.
- Opcional para algunas miniaturas PDF fuera de Docker: Poppler, que proporciona `pdftoppm`. En Ubuntu/Debian, el paquete se llama `poppler-utils`. Los archivos editoriales privados nuevos pueden no generar miniatura; conservan la descarga y la portada elegida.

Comprobar herramientas:

```sh
git --version
node --version
npm --version
docker --version
docker compose version
```

Si aún no tienes el repositorio, clónalo desde la URL entregada por el equipo y entra en su carpeta. Para continuar el trabajo actual:

```sh
git status --short
git switch update
git branch --show-current
```

Conserva tus modificaciones locales antes de cambiar de rama. Para una entrega concreta, el equipo debe indicar el commit o etiqueta que corresponde; una rama puede seguir recibiendo cambios.

## 3. Configurar el entorno local

```sh
cp -n .env.example .env
```

Edita `.env`. Este ejemplo utiliza puertos distintos de los de otras instalaciones locales:

```dotenv
COUCHDB_USER=cimu_service
COUCHDB_PASSWORD='REEMPLAZAR_POR_UNA_CONTRASEÑA_DE_DESARROLLO'
COUCHDB_PORT=15985
COUCHDB_URL=http://127.0.0.1:15985
CIMU_HTTP_PORT=18081

CIMU_ADMIN_EMAIL=administrador@example.test
CIMU_ADMIN_NAME='Administración de desarrollo'
CIMU_ADMIN_PASSWORD='REEMPLAZAR_POR_OTRA_CONTRASEÑA_PROPIA'
CIMU_SEED_DEMO=true
CIMU_BOOTSTRAP=true
```

Los textos `REEMPLAZAR_...` son indicaciones. Define contraseñas propias y diferentes. La del panel necesita al menos 12 caracteres y un máximo de 72 bytes UTF-8. No subas `.env` al repositorio ni lo incluyas en capturas o reportes.

`COUCHDB_USER` es la cuenta técnica de la base; `CIMU_ADMIN_EMAIL` es una cuenta del panel. Los autores de Gaceta y los perfiles de investigadores tampoco son cuentas de acceso.

## 4. Desarrollo diario: CouchDB en Docker y aplicación local

### 4.1. Iniciar solamente la base

Usaremos siempre el proyecto `cimu-dev` para esta modalidad:

```sh
docker compose -p cimu-dev up -d couchdb
docker compose -p cimu-dev ps -a
docker compose -p cimu-dev logs --tail=60 couchdb
```

Espera a que CouchDB aparezca saludable. Fauxton, su interfaz técnica, estará en `http://localhost:15985/_utils/`; utiliza allí la cuenta técnica de CouchDB.

### 4.2. Instalar dependencias e inicializar

```sh
npm ci
npm run db:setup
```

`npm ci` instala las versiones del archivo `package-lock.json`. `db:setup` escribe la inicialización; no es una simulación. En una instalación vacía crea las 18 bases de aplicación, índices, configuración, la primera cuenta administradora/directora y los ejemplos si se solicitaron. CouchDB mantiene además sus bases de sistema.

Los arranques posteriores conservan las cuentas y documentos existentes. Cambiar `CIMU_ADMIN_PASSWORD` después no cambia la contraseña del usuario. La opción demo solo se aplica a la instalación inicial y no repone ejemplos eliminados.

Si el script detecta datos anteriores sin política de acceso, se detiene. Seguir la [migración de accesos](operacion-accesos.md#preparación-y-migración) sobre una copia respaldada; no borrar la base para resolverlo.

### 4.3. Iniciar la interfaz

```sh
npm run dev
```

Mantén esa terminal abierta y accede a:

| Pantalla | URL |
| --- | --- |
| Sitio | `http://localhost:4321` |
| Login | `http://localhost:4321/login` |
| Panel | `http://localhost:4321/admin` |

Ingresa con el correo y la contraseña del panel definidos en `.env`. Este servidor recarga cambios y no necesita Nginx. El script de desarrollo incluye `--host`, por lo que puede escuchar en otras interfaces: utilizarlo en una red de trabajo confiable. Si el puerto está ocupado, Astro puede elegir otro; revisar la URL que imprime la terminal.

`npm run dev` no ejecuta por sí solo el inicializador. Ejecuta `db:setup` antes del primer uso. Si cambias variables, detén el servidor con `Ctrl+C` y vuelve a iniciarlo.

## 5. Alternativa: levantar todo con Docker

Para esta comprobación usa otro proyecto, `cimu-dev-docker`, con su propia base y archivos. Detén antes la base `cimu-dev` si vas a reutilizar el puerto 15985:

```sh
docker compose -p cimu-dev stop couchdb
docker compose -p cimu-dev-docker up --build -d
docker compose -p cimu-dev-docker ps -a
docker compose -p cimu-dev-docker logs --tail=80 frontend
```

Abre `http://localhost:18081/login`. El frontend espera a CouchDB, ejecuta la inicialización y abre el servidor; Nginx espera a que el frontend esté saludable. Node y Poppler ya vienen en la imagen.

El Compose sustituye `COUCHDB_URL` del frontend por `http://couchdb:5984`, utilizando la red interna. El 15985 es para acceder a la base desde el equipo, no para la comunicación entre contenedores.

Después de modificar código:

```sh
docker compose -p cimu-dev-docker up --build -d frontend nginx
```

Un `restart` no incorpora código nuevo a la imagen. El Dockerfile construye una versión compilada: no hay recarga automática ni montaje del código fuente.

Para volver a la modalidad de desarrollo diario:

```sh
docker compose -p cimu-dev-docker stop
docker compose -p cimu-dev up -d couchdb
npm run dev
```

No alternes ambas modalidades contra una misma base sin trasladar también sus archivos: Node local guarda recursos en carpetas del repositorio; el frontend Docker los guarda en volúmenes. Compartir solo CouchDB produciría referencias a archivos que la otra modalidad no tiene.

## 6. Validar cambios antes de entregarlos

Desde la raíz del repositorio:

```sh
npm test
npm run test:integration
```

Las pruebas de integración ya ejecutan `npm run build` y utilizan un servidor CouchDB simulado para sus escenarios HTTP. No sustituyen la comprobación con el CouchDB real del entorno de desarrollo.

También puedes compilar explícitamente:

```sh
npm run build
```

`npm start` ejecuta la versión compilada y, con `CIMU_BOOTSTRAP=true`, comprueba la inicialización. Para trabajo diario utiliza `npm run dev`; la compilación utiliza cookies `Secure` y su despliegue público requiere HTTPS. `npm run preview` tampoco sustituye el servidor de producción documentado.

Prueba funcional mínima con cuentas individuales:

1. Iniciar y cerrar sesión; comprobar Mi cuenta.
2. Crear un colaborador con un módulo y sección concretos; abrir su enlace privado de activación.
3. Confirmar que solo accede al contenido autorizado.
4. Crear un borrador, enviarlo a revisión, aprobarlo y publicarlo con los roles correspondientes.
5. Comprobar que el borrador no aparece en el sitio y que la publicación sí aparece.
6. Adjuntar un archivo nuevo, verificar su acceso público después de publicar y su restricción al retirar el contenido.
7. Consultar el registro de auditoría con administración.

Las matrices y ejemplos completos están en el [manual de roles](manual-roles-permisos.md).

## 7. Datos, archivos y apagado

| Modalidad | Persistencia |
| --- | --- |
| Node local | CouchDB en el volumen del proyecto `cimu-dev`; archivos públicos en `public/uploads`; privados en `storage/private`, salvo `PRIVATE_UPLOAD_DIR` personalizado. |
| Todo Docker | Volúmenes del proyecto `cimu-dev-docker`: `couchdb_data`, `public_uploads` y `private_uploads`. |

El volumen de la base no contiene todos los archivos de publicaciones. Para conservar un entorno, respaldar base, archivos públicos y privados del mismo momento, junto con su versión de código y configuración protegida.

En Node, `Ctrl+C` detiene el servidor. Para la base de desarrollo:

```sh
docker compose -p cimu-dev stop couchdb
```

Para retirar los contenedores de la modalidad completa conservando sus volúmenes:

```sh
docker compose -p cimu-dev-docker down
```

No añadir `--volumes` ni `-v` para un apagado normal: eliminaría los volúmenes del proyecto. No ejecutar limpiezas globales de Docker en equipos con otros sistemas.

## 8. Problemas frecuentes

| Síntoma | Comprobación y solución |
| --- | --- |
| `port is already allocated` | Revisar `docker ps` y los puertos de `.env`. No detener contenedores de otros proyectos. Cambiar `COUCHDB_PORT` y también `COUCHDB_URL` para Node local. |
| No abre `localhost:8081` | Este manual usa 4321 para Node y 18081 para Docker. Revisar `ps -a`; tener solo CouchDB iniciado no levanta la web. |
| Error de conexión a CouchDB | Verificar salud, credenciales y URL. Node usa `127.0.0.1:15985`; el contenedor frontend usa `couchdb:5984`. |
| No existe política de acceso / login 503 | Entorno vacío: ejecutar `db:setup`. Datos antiguos: seguir la migración con respaldo. |
| Cambiar `.env` no cambia el usuario | Las variables iniciales no restablecen cuentas existentes. Usar Mi cuenta o un enlace de restablecimiento generado por administración. |
| Error 403 de origen | Entrar y enviar formularios desde el mismo host, protocolo y puerto; no alternar `localhost` y `127.0.0.1`. Revisar proxy si existe. |
| Error 409 al editar | Otro cambio actualizó la revisión del documento; recargar la ficha y revisar antes de repetir. |
| Error 429 al iniciar sesión | Se alcanzó el límite de intentos; esperar la ventana de 15 minutos. Los intentos exitosos también cuentan para login. |
| Archivos faltantes al cambiar de modalidad | Comprobar dónde están los archivos físicos y no solo los documentos de CouchDB. |
| Docker sigue mostrando la versión anterior | Reconstruir la imagen con `up --build`; revisar que estás en el repositorio y proyecto Docker correctos. |

Si conservas el despliegue externo `Cimu-docker`, sus archivos, puertos y montajes pueden ser distintos. Este manual describe el Compose de este repositorio. La [guía de inicialización](instalacion-inicial.md#8-usarlo-sin-docker-o-en-un-compose-anterior) explica la adaptación del Dockerfile anterior.

## 9. Qué entregar al equipo de servidores

- Commit o etiqueta de la versión y acceso al repositorio/imagen aprobada.
- Resultado de las pruebas y cambios que requieran migración.
- [Manual de producción](manual-produccion.md), [estructura de datos](estructura-base-datos.md) y [operación de accesos](operacion-accesos.md).
- Indicación explícita de instalación vacía o traslado de datos existentes.
- Inventario de archivos y respaldo validado si hay traslado.
- Contacto del equipo que resolverá errores funcionales y de la persona que administrará las cuentas del panel.

Las contraseñas y respaldos se entregan por el mecanismo privado acordado con la universidad, separados del código y la documentación pública.
