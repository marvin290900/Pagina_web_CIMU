# Plan de usuarios, roles y permisos para CIMU

Fecha: 13 de octubre de 2026. Rama analizada: `update`.
Estado: propuesta de implementación; no modifica el comportamiento de la aplicación.

## 1. Diagnóstico del código

La aplicación utiliza Astro con SSR y adaptador Node, componentes Vue y CouchDB. Ya permite almacenar varias cuentas en `users`, con contraseñas bcrypt y sesiones persistentes en `sessions`. La limitación actual es el modelo binario `isAdmin` y la falta de gestión de cuentas y autorización granular.

Hallazgos prioritarios:

| Hallazgo | Evidencia | Consecuencia |
| --- | --- | --- |
| Excepciones públicas por prefijo y sin distinguir método HTTP | `src/middleware.js` | Una ruta autorizada para leer también queda exceptuada para escribir. |
| DELETE de investigaciones sin autenticación propia | `src/pages/api/investigaciones/investigaciones.js` | Por inspección del código, una solicitud anónima puede alcanzar la lógica de eliminación. POST y PUT exigen sesión, pero no permiso de edición. |
| `requirePermission` ignora el permiso solicitado | `src/lib/apiAuth.js` | No proporciona control real de permisos. |
| Páginas administrativas exigen sesión, sin verificar capacidad | `src/middleware.js` | Cualquier cuenta autenticada puede acceder a las interfaces, aunque varias APIs la rechacen. |
| Registro disponible solo para administradores por middleware y crea sesión del usuario nuevo | `src/pages/api/register.js` | Crear una cuenta reemplaza la sesión de quien la creó; no hay asignación de roles. |
| Gestión de usuarios de Gaceta administra autores | Componentes `gestion_usuarios` y APIs de Gaceta | No crea cuentas de acceso. Los autores están en `cimu-gaceta-autores`. |
| Lectura pública de Gaceta incluye activos e inactivos y documentos completos | `src/pages/api/gaceta/obtener.js` | El backend no garantiza la separación entre contenido visible e interno. También entrega perfiles de autores completos. |
| Estado del autor cambia estado de sus publicaciones mediante GET | `src/pages/api/gaceta/desactivar_autor.js` | Mezcla identidad con visibilidad editorial y utiliza lectura para modificar datos. |
| Colecciones y datos de documentos proceden del cliente | APIs `gaceta/crear.js`, `actualizar.js`, `obtener.js` | Faltan listas de colecciones válidas y campos permitidos por operación. |
| Sesiones de 30 días con token guardado directamente | `src/lib/session.js` | No hay estado de cuenta, revocación global ni límite absoluto separado de renovación. La renovación de base de datos no sincroniza la cookie ni el objeto retornado. |
| Archivos cargados se guardan en `public/uploads` | APIs de subida | Una futura noticia o investigación en borrador podría tener archivos accesibles directamente. |
| REMI obtiene una edición desde un sitio externo | `src/pages/api/remi/obtener_revista.js` | No existe aquí un flujo completo de gestión editorial de revistas. |

Estos hallazgos proceden de revisión estática. No se consultó CouchDB, no se verificó cuántas cuentas existen y no se ejecutaron operaciones destructivas ni pruebas sobre datos reales.

## 2. Modelo de autorización

Usar roles que agrupen permisos, combinados con alcance y reglas sobre el documento. Cada decisión debe considerar: cuenta activa, permiso de acción, módulo o sección asignada, propiedad o asignación del contenido y estado editorial.

Ejemplo: un colaborador de Opinión puede crear un borrador y editar sus propios borradores en Opinión. No puede cambiar un ID para editar contenidos ajenos, trasladarlos a Actualidad ni enviar `estado: publicado` para saltarse la revisión.

Los permisos estarán definidos en código y los roles iniciales serán predefinidos. Evitar en la primera versión excepciones individuales y un constructor libre de roles. Una cuenta podrá tener varias asignaciones explícitas, cada una con su propio alcance; no combinar el permiso de una asignación con el alcance de otra para ampliar accesos accidentalmente.

| Rol inicial | Responsabilidades | Límites |
| --- | --- | --- |
| Administrador del sistema | Cuentas, asignación de roles, sesiones, configuración y auditoría | No adquiere automáticamente atribuciones editoriales; se le puede asignar además dirección editorial. |
| Director editorial | Revisión, aprobación, publicación, retiro y archivo en módulos asignados | No administra cuentas ni roles por defecto. |
| Editor | Crear y editar contenidos asignados, revisar y devolver correcciones | No publica ni administra cuentas por defecto. |
| Colaborador | Crear, editar borradores propios y enviar a revisión | Solo módulos y secciones asignados; no publica. |
| Consulta interna | Leer contenido interno autorizado | Sin modificaciones ni lectura de secretos de cuentas. |

Secciones de Gaceta: Actualidad, Vida universitaria, Opinión, Memoria y Audiovisuales. Usar identificadores canónicos basados en las categorías reales de almacenamiento, con etiquetas de interfaz separadas.

Permisos orientativos: `users.read`, `users.create`, `users.update`, `users.disable`, `users.assign_roles`, `sessions.revoke`, `audit.read`; y por módulo, `gaceta.read_internal`, `gaceta.create`, `gaceta.edit_own`, `gaceta.edit_assigned`, `gaceta.review`, `gaceta.publish`, `gaceta.unpublish`, `gaceta.archive`, `gaceta.feature`. Aplicar el mismo patrón a `libros` e `investigaciones`; gestionar investigadores, autores, colecciones y carrusel con permisos independientes.

La lectura pública no necesita una cuenta ni un rol de visitante. Una persona puede figurar como autora de una publicación sin tener acceso administrativo.

## 3. Datos propuestos en CouchDB

- `users`: identidad de acceso, email normalizado, nombre, `passwordHash`, estado (`invited`, `active`, `disabled`), asignaciones de rol y alcance, `authVersion`, fechas y creador. Nunca devolver el hash en APIs.
- `sessions`: hash de token aleatorio, usuario, versión de autenticación, creación, última actividad, expiración por inactividad y expiración absoluta. Mantener cookies HttpOnly, Secure en HTTPS y SameSite.
- `account_tokens`: hashes de tokens de invitación y recuperación, propósito, usuario, expiración y consumo único.
- `audit_events`: actor, acción, recurso, fecha, resultado y cambios relevantes filtrados. No guardar contraseñas ni tokens.
- Perfiles públicos de autores e investigadores: conservar bases existentes y enlazar opcionalmente desde la cuenta. No fusionar automáticamente por correo.
- Contenidos: `createdBy`, `updatedBy`, responsables asignados, estado editorial, fecha de publicación y autoría pública separados.
- Archivos: propietario o recurso asociado, módulo y visibilidad. Borradores fuera de `public`; entrega mediante endpoint autorizado.

Definir índices según consultas: usuario por email normalizado; sesiones por hash, usuario y expiración; contenido por estado, sección y responsables; auditoría por actor/recurso y fecha. Un índice Mango no garantiza unicidad del email: implementar una reserva mediante ID determinista y tratar conflictos 409, con compensación y recuperación si falla la creación de la cuenta.

CouchDB no proporciona una transacción entre todos esos documentos. Diseñar creación, reservas y auditoría con operaciones idempotentes, manejo de `_rev` y reconciliación; no prometer atomicidad entre cuentas, perfiles y publicaciones.

## 4. Inicio de sesión y gestión de personal

Mantener un único formulario de acceso. El servidor obtiene los roles de la cuenta; el usuario no elige ni envía un rol para iniciar sesión. Redirigir a un destino interno permitido o a un panel acorde a sus accesos.

Crear `/admin/usuarios`, separado de los perfiles de autores. Permitir invitar o crear cuentas, asignar roles y alcances, desactivar accesos, revocar sesiones y consultar actividad. Crear cuentas nunca debe cambiar la cookie de quien administra.

Sin registro público para el personal. Preferir invitaciones de un solo uso y configuración de contraseña por su titular. Si no hay correo transaccional, definir un mecanismo inicial de entrega privada sin exponer tokens en listados o logs.

Validar entradas con Zod, normalizar emails, limitar intentos de acceso por cuenta e IP, dar errores genéricos y proteger mutaciones contra CSRF con validación de origen y/o token según la operación. Configurar los límites de intentos para varios procesos si el despliegue los utiliza. Ofrecer cambio y recuperación de contraseña; exigir autenticación reciente para cambios sensibles.

Al desactivar una cuenta, cambiar contraseña o modificar privilegios, invalidar sus sesiones con `authVersion` y resolver permisos vigentes desde el servidor. Prohibir desactivar o degradar al último administrador activo, incluida la concurrencia. Proponer MFA para cuentas privilegiadas en una fase posterior.

## 5. Flujo editorial

Flujo inicial: `borrador → en_revision → aprobado → publicado → archivado`. Desde revisión se puede devolver a borrador con observaciones; la aprobación y la publicación son acciones explícitas aunque inicialmente las desempeñe el mismo rol.

Validar transiciones en el servidor. No permitir cambiar estado mediante una actualización genérica. Una modificación de contenido publicado debe producir una revisión de trabajo y conservar la versión pública hasta aprobarla y publicarla; para el primer incremento se puede bloquear su edición directa hasta incorporar ese mecanismo.

Los endpoints públicos listarán exclusivamente contenido publicado y campos públicos, también al consultar por ID, buscar o cargar destacados. Retirar contenido exige permiso específico. Desactivar la cuenta del autor no retira automáticamente sus publicaciones. Archivar será la opción habitual; la eliminación definitiva requerirá reglas especiales y revisión de archivos asociados.

Para REMI, mantener inicialmente la consulta externa. Gestionar números, artículos y arbitraje dentro de este proyecto, o integrar cuentas con la plataforma externa, es un alcance adicional que requiere decidir dónde reside la gestión de la revista. Un rol local no concede permisos en el sistema externo.

## 6. Cambios por fases

### Fase 0: cerrar brechas de acceso existentes

1. Inventariar cada ruta y método como público o protegido; reemplazar excepciones por prefijo con reglas exactas por método.
2. Proteger DELETE de investigaciones y elevar POST/PUT al permiso de edición correspondiente.
3. Hacer que `requirePermission` realmente verifique permisos; denegar permisos desconocidos.
4. Corregir registro administrativo para no crear sesión del usuario nuevo.
5. Cambiar las mutaciones GET a PATCH/POST y validar origen de solicitudes de escritura.
6. Restringir colecciones y campos, y separar lectura pública de lectura administrativa.

Aceptación: solicitudes anónimas no pueden escribir ni eliminar; una cuenta sin capacidad no puede modificar contenido ni ver paneles restringidos.

### Fase 1: núcleo de cuentas y permisos

Crear módulos `roles`, `permissions`, `authorization`, `users` y validación de entradas. Refactorizar `auth.js`, `session.js`, `apiAuth.js` y middleware para resolver una sola vez la identidad en `locals`, con comprobaciones de acción y recurso en los servicios que escriben datos. Retirar gradualmente `isAdmin`, sin mantenerlo como bypass permanente.

Aceptación: permisos por módulo, sección y propiedad comprobados en servidor; cambios de privilegios y desactivación invalidan sesiones; conflictos de datos no permiten escalamiento.

### Fase 2: gestión de cuentas e interfaz

Crear APIs y pantalla de cuentas, invitaciones, cambio/recuperación de contraseña y revocación. Adaptar `navbar_admin.astro`, layouts y componentes Vue para mostrar acciones autorizadas. Renombrar la gestión de usuarios de Gaceta a gestión de autores, preservando enlaces o agregando redirección.

Aceptación: el administrador crea un colaborador sin perder su sesión; cada persona accede solo a sus módulos; perfiles públicos y cuentas siguen separados.

### Fase 3: publicación y archivos

Aplicar estados y transiciones primero a Gaceta y después a libros e investigaciones. Añadir revisión de contenido publicado, permisos de destacados, auditoría y archivos privados vinculados a recursos. Los permisos de subida deben derivarse del recurso y módulo, no de la carpeta enviada por el cliente.

Aceptación: un colaborador envía su noticia; un editor la revisa; dirección la publica. El sitio público no revela borradores, inactivos ni archivos privados.

### Fase 4: migración y puesta en producción

Preparar respaldo y ensayo sobre copia de datos. Migración idempotente con modo de simulación: asignar al administrador actual administración y dirección editorial para conservar su trabajo; inventariar otras cuentas; no otorgar privilegios basándose en perfiles públicos. Establecer responsables del contenido histórico mediante una asignación explícita, sin inventar autoría personal.

No equiparar automáticamente `activo` con `publicado`: revisar el significado y uso actual de ese campo. Migrar estados y mover archivos privados conservando referencias. Revocar sesiones antiguas al activar el nuevo modelo. Registrar resultados, verificar acceso administrativo y visibilidad pública, y disponer de reversión del código y respaldo compatible antes del cambio.

## 7. Pruebas necesarias

- Tabla de casos por rol, módulo, sección, acción, propietario y estado, con accesos permitidos y denegados.
- Llamadas directas a API con IDs ajenos, secciones no asignadas, colecciones inválidas y estados manipulados.
- Métodos alternativos y rutas parecidas no heredan excepciones públicas.
- Anónimo: lectura publicada permitida; escritura, borradores y archivos privados denegados.
- Cuenta desactivada o sesión expirada/revocada: acceso denegado inmediatamente.
- Alta de cuenta conserva la sesión administrativa; email duplicado y concurrencia se resuelven sin privilegios indebidos.
- No se puede eliminar el último administrador ni asignarse roles sin capacidad.
- Crear y revisar una publicación no la hace pública; editar una publicada no filtra cambios pendientes.
- Conflictos `_rev` producen 409 y no sobreescriben cambios silenciosamente.
- Migración repetible y flujo completo de Gaceta, libros e investigaciones; build de Astro.

Las primeras pruebas usarán dobles de CouchDB y una base aislada para integración, nunca eliminaciones sobre publicaciones reales.

## 8. Decisiones pendientes

Esta propuesta parte de cuentas internas creadas por administración, colaboradores limitados a contenido propio y dirección editorial responsable de publicar. Confirmar si habrá colaboradores externos, quién publica en cada sección, cómo se enviarán invitaciones y si REMI seguirá gestionándose externamente. Estas decisiones ajustan roles y entregas, sin impedir abordar primero las brechas actuales.

Referencias de seguridad: [autorización OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) y [sesiones OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html). Fundamentan la denegación por defecto, comprobación por solicitud y protección y revocación de sesiones.
