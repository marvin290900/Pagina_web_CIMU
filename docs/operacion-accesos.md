# Operación de cuentas y permisos

Implementado el 15 de octubre de 2026 en la rama `update`. Este documento describe el código preparado; no implica despliegue ni migración de datos reales.

## Funciones disponibles

- `/admin/usuarios`: cuentas internas, múltiples asignaciones de rol y alcance, activaciones/desactivaciones, revocación de sesiones y restablecimiento de acceso.
- `/activar-cuenta`: establecer contraseña mediante enlace privado de un solo uso. El token viaja en el fragmento de la URL, no en el query del servidor. Se elimina del historial al abrir la página.
- `/admin/cuenta`: identidad y cambio de contraseña. Cambiarla cierra todas las sesiones.
- `/admin/auditoria`: las últimas 100 operaciones registradas; no contiene contraseñas ni tokens.
- Gaceta, libros e investigaciones: borrador → revisión → aprobación → publicación. Dirección puede retirar a borrador o archivar. En Gaceta puede además actualizar directamente las publicaciones visibles o archivadas: se conserva su estado y el cambio es inmediato si están publicadas. Libros e investigaciones requieren retirar a borrador antes de editar. Todavía no existe edición paralela de una versión publicada.
- Gestión directa de Gaceta: el título y «Abrir publicación» llevan a una vista previa privada, también para borradores y archivadas. Dirección puede eliminar una noticia con confirmación y control de revisión; la eliminación es definitiva desde el panel y queda auditada. Se conservan los archivos físicos. «Archivar / ocultar» retira del sitio sin eliminar, y «Volver a mostrar» restaura noticias que se archivaron estando publicadas.
- Asignación de responsables: dirección puede asignar editores que tengan acceso al módulo y sección. Un editor no modifica contenidos ajenos sin asignación. Puede revisarlos dentro de su alcance.
- Archivos nuevos de contenido editorial fuera de `public`: solo su propietario puede abrirlos antes de asociarlos; después se autoriza según el contenido. Una vez publicado, se entregan públicamente; retirar el contenido vuelve a restringirlos.
- Perfiles de autores e investigadores separados de las cuentas. Las publicaciones públicas de los perfiles se derivan de contenidos publicados. Cambiar el estado de un autor no retira sus artículos.
- REMI sigue consultándose externamente. Los roles de CIMU no administran cuentas en la plataforma de revistas.

## Roles

| Rol | Responsabilidad |
| --- | --- |
| Administrador | Cuentas, asignación de roles, sesiones y auditoría. No publica por ese rol. |
| Director editorial | Crear, asignar, revisar, publicar, retirar y archivar en sus módulos y secciones. Administra también los módulos auxiliares que se le asignen. |
| Editor | Crear borradores, editar propios o asignados, revisar y aprobar dentro de su alcance. |
| Colaborador | Crear y editar borradores propios, enviarlos a revisión y consultar su contenido. |
| Consulta interna | Leer contenido interno de los módulos editoriales asignados. |

Los módulos auxiliares son autores, investigadores e inicio/carrusel: su administración requiere dirección editorial con ese módulo. Consulta, edición y colaboración se aplican al contenido de Gaceta, libros e investigaciones. Las secciones solo limitan Gaceta.

Asignar administración y dirección a la misma persona es válido. Los permisos de una asignación no se combinan con el alcance de otra para conceder más acceso.

## Preparación y migración

Usar Node 22.16 o posterior. Configurar `COUCHDB_URL`, `COUCHDB_USER` y `COUCHDB_PASSWORD` en el entorno del servidor o en `.env` para los scripts locales. Las credenciales de CouchDB nunca deben exponerse al cliente. Usar una cuenta de servicio restringida a las bases de la aplicación.

Antes del despliegue:

1. Respaldar las bases de CouchDB y los archivos de `public/uploads`. Verificar una restauración en un entorno separado.
2. Detener las escrituras de la aplicación anterior durante la migración. No mezclar instancias antiguas y nuevas.
3. Ejecutar primero `npm run access:migrate`. Es una simulación: lee y muestra cantidades, sin escribir ni imprimir credenciales.
4. Revisar las cuentas, duplicados de correo, publicaciones activas e inactivas. Corregir duplicados antes de continuar.
5. Después de verificar que `activo` significa publicado en los datos existentes, aplicar: `npm run access:migrate -- --apply --legacy-active-is-published`.
6. Reiniciar con el código nuevo, iniciar sesión con el administrador existente y verificar la lectura pública y las cuentas antes de invitar personal.

La aplicación requiere la política migrada para iniciar sesión; no utiliza `isAdmin` como acceso alternativo. Sin migración, el login devuelve 503 con la indicación correspondiente.

La migración es repetible y conserva hashes de contraseña. Convierte los administradores anteriores en administradores y directores de todos los módulos. Desactiva las demás cuentas anteriores para revisar sus atribuciones antes de habilitarlas. No convierte autores públicos en cuentas de acceso. No inventa quién creó publicaciones históricas: conservan propietario nulo y dirección puede asignar responsables.

Gaceta: `activo` se convierte en `publicado` y los demás estados en `archivado`, únicamente al utilizar la opción explícita indicada. Libros e investigaciones que ya se entregaban públicamente se marcan publicados. Los contenidos que ya tienen estado editorial no se remigran. Las sesiones antiguas no son aceptadas y deben iniciarse de nuevo.

El script crea las bases e índices necesarios. No crea un usuario administrador de cero: espera encontrar la cuenta administradora que ya existe en este proyecto.

## Contraseñas e invitaciones

Crear la cuenta y entregar el enlace personalmente por un canal privado. El primer enlace vence en 24 horas; un restablecimiento vence en una hora. No se ha configurado un proveedor de correo ni recuperación pública automática. Para recuperar acceso, administración genera un enlace nuevo.

El enlace de restablecimiento invalida inmediatamente la contraseña anterior y las sesiones. No compartirlo en canales públicos. El formulario nunca solicita ni almacena la contraseña de otro usuario en el navegador del administrador.

Las contraseñas nuevas requieren al menos 12 caracteres y como máximo 72 bytes UTF-8, por el límite de bcrypt. Los cambios sensibles de cuentas exigen una sesión iniciada hace menos de diez minutos; si se devuelve 401, volver a iniciar sesión.

No se puede degradar o desactivar al último administrador activo. Conviene mantener al menos dos personas administradoras con credenciales individuales. MFA queda como mejora posterior.

## Sesiones y despliegue

Tokens aleatorios de 32 bytes; CouchDB almacena su hash, no el token. Cookie HttpOnly, SameSite=Lax y Secure en producción. Expiración por inactividad: 24 horas; límite absoluto: siete días. La renovación actualiza también la cookie. Desactivar la cuenta o cambiar roles, contraseña o versión de autenticación invalida sus sesiones.

Producción necesita HTTPS. El proxy debe conservar correctamente host y protocolo para validar el origen de las solicitudes. No confiar indiscriminadamente en cabeceras de IP enviadas por el cliente: revisar la configuración de proxy del adaptador antes del despliegue.

El limitador de acceso es compartido entre procesos mediante CouchDB: diez intentos por correo y cincuenta por IP en ventanas de 15 minutos. Cuenta también los accesos exitosos. Cambios de contraseña y activaciones tienen límites propios.

Definir `PRIVATE_UPLOAD_DIR` como una ruta absoluta persistente, accesible solo por el servidor, fuera de cualquier raíz pública o alias del proxy. Por defecto es `storage/private` en el directorio del proceso. Respaldarla junto con `private_assets` y los documentos editoriales. Los PDFs nuevos pueden no tener miniatura; se mantiene su descarga y la portada seleccionada para libros.

Los archivos publicados antes de este cambio conservan sus URLs anteriores en `public/uploads`. Su confidencialidad retroactiva requiere inventariar referencias, trasladarlos y retirar las copias públicas; esta tarea debe hacerse sobre la copia restaurada antes de afirmar que material histórico retirado ya no es descargable. La protección automática implementada cubre los archivos nuevos del flujo editorial.

## Mantenimiento y verificación

- `npm test`: pruebas de permisos, propiedad, transiciones, sesiones, cuentas, concurrencia, migración, rutas y sanitización; usan CouchDB en memoria.
- `npm run test:integration`: compila y ejecuta el flujo HTTP con una instancia temporal de la aplicación, archivos temporales y CouchDB simulado en localhost. No consulta `.env` para conectar con la base real; las variables se sustituyen para el proceso de prueba.
- `npm run build`: compilación de Astro/Vue.
- `npm run auth:cleanup`: simula limpieza de sesiones y ventanas de intentos vencidas; agregar `-- --apply` para aplicar durante mantenimiento.

La política de identidades y permisos está en un único documento `users/security-policy`, actualizado con CAS (`_rev`). Esto serializa cambios de roles, unicidad de correo y protección del último administrador incluso con varios procesos. Las credenciales están separadas en documentos de usuario. Es apropiado para un equipo editorial; si crece a miles de cuentas deberá reemplazarse por un almacén transaccional diseñado para esa escala.

Las operaciones entre contenido, archivos y auditoría no son una transacción distribuida. Conservar respaldos y revisar fallos de escritura; un archivo subido sin documento asociado queda privado. Los cambios de cuentas llevan además un registro acotado dentro de la política.

La instalación de dependencias informó alertas en el árbol existente. No se aplicaron actualizaciones masivas ni `npm audit fix --force`; revisar esas dependencias antes de producción. DOMPurify se incorporó para sanitizar las vistas previas y publicaciones.

## Reversión

Revertir una instalación necesita el código anterior y el respaldo compatible de bases y archivos. No basta con quitar `security-policy`: las cuentas nuevas no tienen el antiguo modelo `isAdmin`, las contraseñas podrían haber cambiado y las sesiones viejas no son válidas en el código nuevo. Ensayar la reversión en el entorno de copia.
