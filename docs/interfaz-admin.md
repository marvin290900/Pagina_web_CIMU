# Interfaz del espacio editorial

El panel principal es un menú de aplicaciones con búsqueda. Muestra únicamente los módulos que la cuenta puede abrir. Los colores e iconos ayudan a reconocer cada aplicación, y el menú lateral sigue disponible durante el trabajo.

## Cuentas y permisos

El listado de cuentas permite buscar por persona, correo y rol, filtrar por estado o rol y abrir una ficha individual. Las rutas `/admin/usuarios/nueva` y `/admin/usuarios/:id` están protegidas por los mismos permisos administrativos que las APIs de cuentas.

En la ficha se editan el nombre, el estado y las asignaciones de roles. Cada asignación conserva sus propios módulos y secciones de Gaceta. Los nombres visibles de módulos y secciones son descriptivos; los identificadores internos no se muestran como etiquetas. Administración de cuentas no concede atribuciones editoriales por sí sola.

Crear una invitación genera un enlace privado que se muestra solo en esa pantalla. El enlace se entrega personalmente; no se envían correos automáticamente. Guardar una cuenta o cerrar sus sesiones revoca sus accesos anteriores. Los cambios sensibles siguen requiriendo una sesión iniciada hace menos de diez minutos. La protección del último administrador y el control de versiones se mantienen en el servidor.

## Publicaciones

Libros e Investigaciones comparten la tabla, los filtros, la ficha, la barra de estados y las confirmaciones de acciones editoriales. Cada registro tiene un enlace directo mediante `?registro=...` y se obtiene de la lista interna autorizada. La creación y edición conservan los contratos de las APIs existentes. Editar estos dos catálogos requiere estado borrador y permisos sobre el documento.

Gaceta abre un menú para Publicaciones, Autores públicos y Destacados según los permisos de la cuenta. Las acciones de cambio de estado se muestran directamente en la ficha de publicación: ya no están dentro de «Más acciones». Ese menú conserva únicamente la eliminación definitiva cuando está autorizada.

La acción Publicar se habilita después de la aprobación y solo para quien puede publicar. Archivar y volver a borrador aparecen cuando la transición está permitida. Una cuenta de consulta recibe una explicación de que no tiene cambios de estado disponibles. Las publicaciones de Gaceta archivadas desde publicado conservan la opción de volver a publicar para dirección.

Las fechas que solo contienen año, mes y día mantienen su día al mostrarse; las marcas de tiempo se presentan en la zona de El Salvador.

## Mi cuenta

El módulo separa la identidad, los roles y alcances asignados, y el formulario de cambio de contraseña. El cambio sigue cerrando todas las sesiones y redirigiendo al inicio de sesión. La interfaz muestra las consecuencias antes de guardar y conserva la validación del servidor.

## Instalación local y Docker

El rediseño no necesita una migración de datos adicional. Los cambios de esta copia del repositorio no se reflejan por reiniciar una imagen antigua. Si Docker utiliza otra carpeta del frontend, primero hay que actualizar esa copia y reconstruir el servicio `frontend` desde la carpeta del Compose.

Si otro proyecto ocupa el puerto 5984, se puede publicar CouchDB de CIMU en otro puerto del host manteniendo `couchdb:5984` dentro de la red del Compose. Conservar el mismo ajuste al recrear los servicios.
