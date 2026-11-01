# Manual de roles, permisos y flujo editorial

**CIMU | Guía para administración y equipo editorial**

Versión 1.0 | 23 de octubre de 2026

Referencia: rama `update`, revisión `331c25c`.

Este manual describe los permisos implementados en el código revisado. Estandariza sus nombres y su interpretación para el equipo; no cambia los roles, las cuentas ni los permisos del sistema. Si una instalación utiliza otra versión, sus pantallas pueden diferir.

**La regla que debes recordar:** una acción necesita un rol que la permita, el alcance correcto y un registro en un estado compatible. Una cuenta debe estar activa y tener una sesión válida para trabajar en el panel.

## Cómo utilizar este manual

- **Si usas el sistema:** comienza por los roles, la matriz editorial, el flujo y la guía de trabajo diario.
- **Si administras cuentas:** revisa además las matrices administrativas, las instrucciones de asignación y los perfiles recomendados.
- **Si mantienes el proyecto:** consulta el diccionario técnico y las reglas de mantenimiento al final.

Todos los nombres y publicaciones de los ejemplos son ficticios.

<!-- index -->
<!-- page -->

## 01. Cómo se decide un permiso

Un **rol** reúne capacidades. El **alcance** indica dónde se aplican: módulos y, en Gaceta, secciones. Una **asignación** es la combinación de un rol con su propio alcance. Una persona puede tener varias asignaciones.

### Los cinco controles

1. **Cuenta y sesión:** la persona debe tener una cuenta activa y haber iniciado sesión.
2. **Acción:** algún rol asignado debe permitir lo que quiere hacer: consultar, crear, revisar, publicar, etc.
3. **Alcance:** esa misma asignación debe incluir el módulo y la sección correspondientes.
4. **Relación con el registro:** cuando el permiso es sobre contenido propio o asignado, el sistema comprueba quién lo creó o quién es responsable de edición.
5. **Estado y versión:** el estado debe admitir la operación. Para guardar cambios se comprueba también que otra persona no haya actualizado antes el registro.

> Una sola asignación debe cumplir el permiso y su alcance. No se toma el poder de un rol y se aplica al alcance de otro.

### Módulos y secciones

| Módulo | Qué se gestiona | Cómo se limita el alcance |
| --- | --- | --- |
| Gaceta | Noticias y publicaciones de la comunidad | Por módulo y por sección |
| Libros | Catálogo de libros y colecciones | Por módulo; sin restricción por colección |
| Investigaciones | Registros y documentos de investigación | Por módulo; sin restricción por programa |
| Autores públicos | Firmas y perfiles de Gaceta | Por módulo |
| Investigadores | Perfiles académicos utilizados por el catálogo | Por módulo |
| Inicio y carrusel | Imágenes de la página principal | Por módulo |

Las secciones de Gaceta son **Actualidad, Vida universitaria, Opinión, Memoria y Audiovisuales**. La opción **Todas las secciones** concede alcance a todas las secciones admitidas. El campo categoría de una publicación no reemplaza este control.

**Ejemplo:** Editor + Gaceta + Opinión permite revisar publicaciones de Opinión. No permite revisar Actualidad ni publicar noticias, aunque la persona conozca el enlace de esos registros.

<!-- page -->

## 02. Los cinco roles oficiales

### Administrador

Gestiona cuentas internas: invita personas, modifica roles y alcances, desactiva cuentas, cierra sesiones, restablece acceso y consulta la auditoría. Este rol no concede acceso editorial por sí solo.

**Ejemplo:** Luis puede crear la cuenta de una editora. Para publicar noticias, Luis necesita además una asignación de Director editorial en Gaceta y las secciones correspondientes.

### Director editorial

Dirige el contenido dentro de su alcance: consulta, crea, edita, asigna responsables, revisa, aprueba, publica, retira a borrador y archiva. En Gaceta también puede gestionar destacados, editar noticias publicadas o archivadas y eliminar noticias definitivamente.

**Límite:** no administra cuentas ni concede roles, salvo que tenga además el rol Administrador. Para gestionar autores, investigadores o carrusel necesita incluir esos módulos expresamente.

### Editor

Consulta el contenido interno de su alcance, crea borradores y edita borradores propios o asignados. Puede aprobar registros en revisión y solicitar correcciones. Puede revisar un registro de su alcance aunque no sea su responsable de edición.

**Límite:** no publica, no archiva y no asigna responsables. Consultar un registro ajeno no significa poder modificar su contenido.

### Colaborador

Crea borradores, consulta su propio contenido, edita sus propios borradores y los envía a revisión. Sigue pudiendo consultar sus registros cuando avanzan de estado, pero no editarlos mientras estén en revisión, aprobados, publicados o archivados.

**Límite:** no consulta borradores ajenos, no aprueba ni publica. El rol no concede edición de documentos ajenos por asignación.

### Consulta interna

Lee los registros internos de los módulos y secciones asignados, incluidos los borradores y archivados. No crea contenido, no lo edita y no cambia sus estados.

**Ejemplo:** una persona que acompaña el seguimiento académico puede consultar las investigaciones sin intervenir en el proceso editorial.

### Cuenta, autor y responsable son identidades distintas

- **Cuenta interna:** persona que inicia sesión y recibe permisos.
- **Autor o investigador público:** perfil que firma o acompaña una publicación. Tener un perfil no crea una cuenta de acceso.
- **Responsable de edición:** cuenta autorizada para trabajar un registro. La responsabilidad no convierte a la persona en su autora pública ni le agrega otro rol.

<!-- page -->

## 03. Matriz de permisos editoriales

Esta matriz se aplica a **Gaceta, Libros e Investigaciones**. Cada columna supone que la persona tiene únicamente ese rol. En todos los casos se exige el alcance correcto y el estado compatible.

| Acción | Admin. | Dirección | Editor | Colab. | Consulta |
| --- | --- | --- | --- | --- | --- |
| Consultar todos los registros internos del alcance | No | Sí | Sí | No | Sí |
| Consultar registros creados por la propia cuenta | No | Sí | Sí | Sí | Sí |
| Crear un registro en borrador | No | Sí | Sí | Sí | No |
| Editar un borrador propio | No | Sí | Sí | Sí | No |
| Editar un borrador ajeno | No | Sí | Asignado | No | No |
| Enviar un borrador a revisión | No | Sí | P/A | Propio | No |
| Aprobar un registro en revisión | No | Sí | Sí | No | No |
| Solicitar correcciones: revisión a borrador | No | Sí | Sí | No | No |
| Publicar un registro aprobado | No | Sí | No | No | No |
| Retirar aprobado o publicado a borrador | No | Sí | No | No | No |
| Archivar un registro no archivado | No | Sí | No | No | No |
| Recuperar un archivado a borrador | No | Sí | No | No | No |
| Asignar o quitar responsable de edición | No | Sí | No | No | No |
| Editar Gaceta publicada o archivada | No | Sí | No | No | No |
| Destacar una noticia publicada de Gaceta | No | Sí | No | No | No |
| Eliminar definitivamente una noticia de Gaceta | No | Sí | No | No | No |
| Eliminar definitivamente libros o investigaciones | No | No | No | No | No |

**P/A:** propio o asignado. **Asignado:** el registro ajeno debe estar asignado a esa cuenta. Dirección puede editar cualquier borrador dentro de su alcance, aunque no figure como responsable.

### Cómo interpretar un “Sí”

- No autoriza a trabajar en otro módulo o sección.
- La aprobación corresponde únicamente a registros **en revisión**. No permite saltar de borrador a publicado.
- Enviar a revisión exige permiso de edición sobre ese borrador. Un editor que solo puede leerlo debe recibir la asignación correspondiente para enviarlo.
- La lectura de contenido propio se refiere a la cuenta que creó el registro, no al nombre de su autor público.
- La recuperación directa de Gaceta desde archivado a publicado tiene una condición adicional, explicada en la sección 06.

<!-- page -->

## 04. Cuentas, módulos auxiliares y revistas

### Matriz administrativa y de gestión

| Acción | Admin. | Dirección | Editor | Colab. | Consulta |
| --- | --- | --- | --- | --- | --- |
| Listar y abrir cuentas internas | Sí | No | No | No | No |
| Invitar personas y generar enlace inicial | Sí | No | No | No | No |
| Cambiar nombre o estado de una cuenta | Sí | No | No | No | No |
| Agregar o quitar roles y alcances | Sí | No | No | No | No |
| Cerrar sesiones de otra cuenta | Sí | No | No | No | No |
| Restablecer acceso de otra cuenta | Sí | No | No | No | No |
| Consultar auditoría general | Sí | No | No | No | No |
| Gestionar autores públicos | No | Módulo | No | No | No |
| Gestionar perfiles de investigadores | No | Módulo | No | No | No |
| Gestionar inicio y carrusel | No | Módulo | No | No | No |
| Gestionar colecciones de libros | No | Libros | No | No | No |
| Consultar Mi cuenta y cambiar contraseña propia | Sí | Sí | Sí | Sí | Sí |

**Módulo:** Dirección debe incluir expresamente Autores públicos, Investigadores o Inicio y carrusel, según corresponda. **Libros:** requiere Dirección con el módulo Libros.

### Lo que no se concede por asociación

- Dirección en **Gaceta** no concede automáticamente gestión de **Autores públicos**.
- Dirección en **Libros** no concede automáticamente gestión de **Investigadores**.
- Dirección en **Inicio y carrusel** no concede publicación de noticias ni administración de usuarios.
- Seleccionar un módulo auxiliar para Editor, Colaborador o Consulta interna no habilita sus pantallas de administración: estas exigen Dirección y ese módulo.

### Libros, revistas e investigaciones no son el mismo módulo

El flujo documentado está implementado para Gaceta, Libros e Investigaciones. **REMI mantiene una consulta externa de revistas**; los roles de CIMU no administran las cuentas de esa plataforma.

Existen además rutas heredadas de artículos relacionadas con permisos de Libros. No equivalen a un módulo completo de revistas con el circuito de borrador, revisión y publicación. Sus permisos técnicos se detallan en la sección 15.

<!-- page -->

## 05. El flujo editorial y sus estados

<!-- workflow -->

El registro comienza en **Borrador**. La aprobación confirma la revisión, pero no lo hace público. Solo la acción **Publicar** lo incorpora a las consultas públicas del contenido editorial.

| Origen | Acción y destino | Quién puede realizarla |
| --- | --- | --- |
| Borrador | Enviar a revisión -> En revisión | Quien puede editar ese borrador |
| En revisión | Aprobar publicación -> Aprobado | Editor o Dirección, dentro del alcance |
| En revisión | Solicitar correcciones -> Borrador | Editor o Dirección, dentro del alcance |
| Aprobado | Publicar -> Publicado | Dirección, dentro del alcance |
| Aprobado | Volver a borrador -> Borrador | Dirección, dentro del alcance |
| Publicado | Retirar o volver a borrador -> Borrador | Dirección, dentro del alcance |
| Borrador, en revisión, aprobado o publicado | Archivar -> Archivado | Dirección, dentro del alcance |
| Archivado | Volver a borrador -> Borrador | Dirección, dentro del alcance |
| Gaceta archivada desde publicado | Volver a publicar -> Publicado | Dirección; solo si se archivó estando publicada |

### Qué ocurre en cada etapa

- **Borrador:** se prepara el contenido. Puede haber cambios de texto, archivos y referencias según los permisos del documento.
- **En revisión:** se evalúa el registro. Para corregir su contenido debe regresar a borrador.
- **Aprobado:** está listo para que Dirección decida su publicación. Aún es interno.
- **Publicado:** el contenido está disponible para visitantes. Retirarlo a borrador o archivarlo lo elimina de las consultas públicas del módulo.
- **Archivado:** se conserva internamente y se puede consultar con los permisos adecuados. No es una papelera ni una eliminación definitiva.

Cada transición registra su origen, destino, fecha, cuenta que actuó y observación, si se agregó. La pestaña **Actividad** permite consultar ese historial.

> La barra superior muestra el estado actual. No es una autorización para saltar etapas. La aprobación y la publicación son acciones diferentes.

**Fecha de publicación:** indicar una fecha futura en un formulario no programa automáticamente la publicación. En Gaceta, la transición normal a publicado registra la fecha de ese momento; la restauración directa desde archivado conserva la fecha existente.

<!-- page -->

## 06. Editar, retirar, archivar y restaurar

### Cuándo se puede modificar el contenido

| Módulo y estado | Edición permitida |
| --- | --- |
| Gaceta en borrador | Colaborador: propio. Editor: propio o asignado. Dirección: cualquier registro de su alcance. |
| Gaceta en revisión o aprobada | Nadie edita el contenido directamente en esos estados. Primero se devuelve a borrador. |
| Gaceta publicada | Dirección puede editar directamente dentro de su alcance. Guardar mantiene publicado y el cambio es visible de inmediato. |
| Gaceta archivada | Dirección puede editar dentro de su alcance. Guardar mantiene archivado; no la vuelve pública. |
| Libros o Investigaciones en borrador | Colaborador: propio. Editor: propio o asignado. Dirección: cualquier registro de su alcance. |
| Libros o Investigaciones en otro estado | Primero deben volver a borrador. No existe edición directa de una versión publicada. |

### Tres acciones diferentes

**Retirar a borrador:** conserva el registro y permite corregirlo. Si estaba publicado, deja de mostrarse. Para publicarlo de nuevo debe avanzar por revisión, aprobación y publicación.

**Archivar:** conserva el registro y su historial. Si estaba visible, deja de aparecer en el sitio. Para Libros e Investigaciones, la recuperación es a borrador y luego se repite el circuito editorial.

**Eliminar:** en Gaceta, Dirección puede eliminar definitivamente una noticia de su alcance con confirmación. El registro se elimina del panel; se conserva un evento de auditoría y no se borran automáticamente sus archivos físicos. Libros e Investigaciones tienen deshabilitada la eliminación definitiva.

### Excepción de restauración de Gaceta

Una noticia archivada **desde publicado** puede volver directamente a publicado. Si se archivó desde borrador, revisión o aprobado, debe volver a borrador y completar el circuito. Dirección puede editar la noticia mientras está archivada; si luego la restaura directamente, se publicará el contenido actualizado sin otra aprobación obligatoria.

### Archivos y visibilidad

Los archivos nuevos vinculados al flujo privado siguen la autorización del registro: al publicarlo son públicos; al retirarlo vuelven a restringirse. Los archivos antiguos que siguen en rutas públicas pueden conservar enlaces accesibles. **Archivar no garantiza retirar de Internet todos los archivos históricos ni copias ya descargadas.**

<!-- page -->

## 07. Administración: invitar a una persona

### Antes de crear la cuenta

Define qué tarea realizará la persona, en qué módulos y en qué secciones. Utiliza una cuenta individual y el correo de esa persona. Un perfil de autor o investigador no sustituye este registro.

### Procedimiento

1. Inicia sesión con una cuenta que tenga el rol **Administrador**.
2. Abre **Panel > Cuentas y permisos > Invitar persona**.
3. Completa nombre y correo. El sistema normaliza el correo y evita duplicados.
4. Selecciona un rol. Para los roles editoriales, marca al menos un módulo.
5. Si incluyes Gaceta, selecciona sus secciones o Todas las secciones.
6. Si necesita otra responsabilidad o un alcance distinto, utiliza **Agregar otro rol y alcance**. Cada asignación conserva su propio alcance.
7. Pulsa **Crear invitación** y copia el enlace privado mostrado en esa pantalla.
8. Entrégalo personalmente por un canal privado. La persona abre el enlace y establece su contraseña antes de que venza.
9. Comprueba que la cuenta quede activa y que pueda abrir únicamente las aplicaciones esperadas.

### Estados de la cuenta

| Estado visible | Significado | Qué debe ocurrir |
| --- | --- | --- |
| Invitación pendiente | Aún no ha completado la activación inicial | La persona establece su contraseña mediante el enlace |
| Activa | Puede iniciar sesión y usar los permisos asignados | Trabaja dentro de sus roles y alcances |
| Desactivada | No puede iniciar sesión ni mantener una sesión válida | Administración revisa si corresponde habilitarla de nuevo |

El enlace inicial vence en **24 horas** y es de un solo uso. El sistema no envía automáticamente la invitación por correo. Si se pierde o vence, Administración puede generar un nuevo enlace mediante Restablecer acceso; ese nuevo enlace vence en una hora.

> Administración no establece ni necesita conocer la contraseña de otra persona. La cuenta invitada no se activa simplemente cambiando un selector: su titular debe completar la activación.

El correo identifica la cuenta y no se modifica desde la ficha actual. No existe registro público libre de cuentas internas.

<!-- page -->

## 08. Administración: modificar y proteger accesos

### Agregar o quitar permisos

1. Abre **Cuentas y permisos** y busca a la persona por nombre, correo o rol.
2. Entra en su registro y revisa sus asignaciones actuales.
3. Modifica los módulos o las secciones de una asignación para ajustar su alcance.
4. Agrega otro rol si necesita una responsabilidad adicional. Quita una asignación si ya no corresponde; la cuenta debe conservar al menos una.
5. Revisa todos los roles: quitar un permiso de una asignación no lo retira si otra asignación todavía lo concede sobre el mismo contenido.
6. Guarda los cambios. Las sesiones anteriores de esa cuenta quedan revocadas para aplicar su nueva configuración.
7. Pide a la persona que vuelva a iniciar sesión y verifique sus accesos.

**Sesión reciente:** crear o modificar cuentas, cerrar sesiones y restablecer acceso requieren una sesión iniciada hace no más de diez minutos. Si el sistema pide iniciar sesión de nuevo, hazlo y repite la acción.

### Elegir la acción correcta

| Necesidad | Acción | Resultado |
| --- | --- | --- |
| Terminó su participación en el equipo | Desactivar cuenta y guardar | Impide iniciar sesión y anula sesiones anteriores; no elimina sus publicaciones |
| Debe volver a autenticarse | Cerrar sesiones | Conserva su contraseña y roles |
| Olvidó su contraseña o debe reemplazarse | Restablecer acceso | Invalida la contraseña actual y las sesiones; genera un enlace de una hora |
| Cambió de responsabilidad | Editar roles y alcances y guardar | Aplica los nuevos permisos y revoca sus sesiones anteriores |

Si una cuenta está desactivada, el enlace de restablecimiento no la habilita por sí solo. Administración debe revisar su estado; una cuenta desactivada no puede completar la activación.

### Reglas que debes conocer

- No se puede quitar o desactivar al último Administrador activo.
- Si cambias tus propios permisos o cierras tus propias sesiones, tendrás que volver a ingresar.
- No hay una función de eliminación de cuentas internas en el flujo actual; se utiliza desactivación.
- Cambiar roles o desactivar a una persona no archiva automáticamente el contenido que creó. Revisa aparte la continuidad del trabajo editorial.
- Si otra persona actualizó la cuenta primero, recarga su ficha antes de guardar. No sobrescribas cambios sin revisarlos.

<!-- page -->

## 09. Guía de trabajo diario para usuarios

### Entrar y reconocer tu espacio

1. Inicia sesión con tu cuenta individual.
2. En **Panel**, busca la aplicación que necesitas. Solo aparecen accesos compatibles con tus permisos.
3. En **Mi cuenta**, revisa tus roles, módulos y secciones. Si falta un acceso, solicita el cambio a Administración.

### Preparar y revisar una publicación

1. En Gaceta, abre **Publicaciones**. Para los otros catálogos, abre **Libros** o **Investigaciones**.
2. Busca por título o utiliza los filtros de estado y sección, colección o programa.
3. Crea un registro o abre su ficha. Los registros nuevos comienzan como borrador.
4. Edita y guarda si tienes autorización sobre ese documento. Guardar no equivale a publicar.
5. Utiliza **Enviar a revisión** cuando el borrador esté listo.
6. Si puedes revisar, lee el contenido y utiliza **Aprobar publicación** o **Solicitar correcciones**. Agrega una observación clara para el equipo.
7. Dirección publica el registro aprobado. Después puede archivarlo o retirarlo a borrador cuando corresponda.

### Si necesitas editar contenido ajeno

Dirección puede asignar un responsable desde la ficha. El selector muestra cuentas con capacidad de edición en ese módulo y sección: en el modelo actual, Editor o Director editorial con alcance compatible. La asignación no permite trabajar en otro módulo o sección, ni editar en un estado prohibido.

Un Colaborador no adquiere acceso a un borrador ajeno por ser mencionado como autor público ni por una asignación de responsable. Para editar contenido ajeno requiere un rol compatible, como Editor, y la asignación correspondiente.

### Cuidar tu cuenta

En **Mi cuenta > Seguridad**, introduce la contraseña actual, la nueva y su confirmación. La nueva debe tener al menos **12 caracteres** y no superar **72 bytes UTF-8**; los caracteres acentuados pueden ocupar más de un byte.

Cambiar la contraseña cierra todas las sesiones, incluida la actual. Luego inicia sesión con la nueva contraseña. **Nunca compartas tu cuenta** para que otra persona complete una revisión o publicación.

> El historial de estados y la auditoría registran operaciones, pero no ofrecen un historial completo de versiones de contenido ni una restauración automática del texto anterior.

<!-- page -->

## 10. Perfiles estándar recomendados

Estas configuraciones son recetas para asignar los roles existentes de forma consistente. **No son roles nuevos ni cambios automáticos del sistema.** Ajusta los alcances a la tarea real de cada persona.

| Perfil de trabajo | Asignaciones sugeridas | Uso esperado |
| --- | --- | --- |
| Administración de accesos | Administrador | Gestionar personas, roles, sesiones y auditoría |
| Responsable de una sección de Gaceta | Director editorial + Gaceta + esa sección | Coordinar y publicar noticias de esa sección |
| Editor de una sección de Gaceta | Editor + Gaceta + esa sección | Revisar y editar borradores propios o asignados |
| Redactor de noticias | Colaborador + Gaceta + secciones necesarias | Crear borradores propios y enviarlos a revisión |
| Seguimiento académico | Consulta interna + Investigaciones | Consultar registros internos sin modificarlos |
| Responsable de catálogo y perfiles | Director editorial + Libros + Investigaciones + Investigadores | Coordinar catálogo, publicaciones y perfiles académicos |
| Responsable de firmas de Gaceta | Director editorial + Autores públicos | Gestionar perfiles de autores; no publica noticias por esa asignación |
| Responsable de portada institucional | Director editorial + Inicio y carrusel | Gestionar imágenes del inicio |
| Persona con doble responsabilidad | Administrador y otra asignación Director editorial con alcance definido | Administrar accesos y realizar la tarea editorial autorizada |

### Ejemplo de dos asignaciones independientes

**Asignación 1:** Director editorial en Libros.

**Asignación 2:** Consulta interna en Gaceta, sección Opinión.

**Resultado:** puede dirigir y publicar Libros, y leer Gaceta en Opinión. No puede crear, aprobar ni publicar noticias de Gaceta con esa configuración.

### Criterios de asignación

- Selecciona solo los módulos necesarios. Las colecciones y programas no son límites de seguridad adicionales.
- Usa Todas las secciones cuando la función realmente lo requiera. Para una responsabilidad local, elige la sección concreta.
- Para una misma persona puedes asignar Editor en una sección y Consulta interna en otra; conserva cada alcance en su propia asignación.
- Como práctica organizativa, conviene contar con dos administradores individuales y revisar los accesos cuando cambian las responsabilidades. El sistema exige conservar al menos uno activo.

<!-- page -->

## 11. Ejemplos completos de Gaceta

### Caso A. De la noticia al sitio público

**Personas:** Ana es Colaboradora en Vida universitaria; Bruno es Editor en esa sección; Carla es Directora editorial en la misma sección.

1. Ana crea “Encuentro estudiantil de investigación”. El registro queda en borrador y pertenece, a efectos de permisos, a la cuenta de Ana.
2. Ana guarda y envía a revisión. El registro deja de poder editarse directamente en ese estado.
3. Bruno lo consulta. Puede revisarlo y aprobarlo porque tiene Editor en esa sección, aunque no sea su responsable de edición.
4. Si detecta errores, Bruno solicita correcciones y explica qué ajustar. El registro vuelve a borrador.
5. Ana corrige su borrador. Si Bruno debe corregirlo en su lugar, Carla lo asigna como responsable; Bruno puede editar ese borrador ajeno.
6. El borrador corregido se envía a revisión y Bruno lo aprueba.
7. Carla utiliza Publicar. La noticia pasa a ser visible para visitantes.

**Resultado clave:** Ana redacta, Bruno revisa y Carla publica. Nadie obtiene permisos sobre Actualidad u Opinión por participar en esta noticia.

### Caso B. Corregir una noticia ya publicada

Carla descubre un error menor en una noticia publicada de su sección. Puede usar Editar publicación y guardar directamente. El estado sigue siendo publicado y la corrección aparece de inmediato en el sitio.

Ana y Bruno no pueden hacer esa edición en vivo con sus roles. Si el equipo quiere repetir la revisión, Carla puede retirar la noticia a borrador, completar las correcciones y hacerla recorrer de nuevo el flujo. Durante ese proceso deja de estar visible.

### Caso C. Archivar y volver a mostrar

Carla archiva una noticia que estaba publicada. Desaparece de las consultas públicas de Gaceta y se conserva internamente. Su ficha ofrece Volver a publicar porque el estado anterior al archivo fue publicado.

Si Carla había archivado un borrador, la restauración directa no corresponde: primero vuelve a borrador y después continúa por revisión, aprobación y publicación.

**Cuidado con las firmas:** cambiar el autor público de una noticia no cambia qué cuenta la creó ni concede al autor una cuenta de acceso. Desactivar un perfil de autor tampoco archiva automáticamente las noticias que ya firmó.

<!-- page -->

## 12. Ejemplos de catálogos y alcances

### Caso D. Corregir un libro publicado

Diego tiene Director editorial en Libros. Debe corregir el resumen de un libro publicado.

1. Abre la ficha y lo retira a borrador. El libro deja de estar visible públicamente.
2. Edita el resumen y guarda. Puede hacerlo él o un Editor autorizado a quien asigne el borrador.
3. El registro se envía a revisión y se aprueba.
4. Dirección vuelve a publicarlo.

No hay una segunda versión privada que se edite en paralelo mientras la anterior sigue publicada. En Investigaciones se aplica la misma regla.

### Caso E. Un investigador firma, otra persona carga el documento

Elena es un perfil de investigadora pública. Fabio, Colaborador en Investigaciones, crea un registro y selecciona a Elena como firmante.

Fabio puede editar y enviar a revisión su propio borrador. Elena no obtiene acceso al panel por aparecer como investigadora. Si necesita trabajar en él, Administración debe crearle una cuenta y concederle un rol apropiado.

Si la cuenta de Elena tiene Editor en Investigaciones, puede consultar el registro. Para editar ese borrador ajeno, Dirección debe asignárselo. Ser la firmante no reemplaza esa asignación.

### Caso F. Dirección en una sección, consulta en otra

Gabriela tiene Director editorial en Gaceta/Actualidad y Consulta interna en Gaceta/Memoria. Puede publicar noticias aprobadas de Actualidad y leer borradores de Memoria. No puede publicar Memoria: la segunda asignación concede lectura, no las capacidades de la primera.

### Caso G. La portada no concede publicación

Hugo tiene Director editorial únicamente en Inicio y carrusel. Puede gestionar imágenes del inicio, pero no publicar libros, noticias ni investigaciones. Para otra tarea necesita la asignación correspondiente.

### El sistema no obliga a que participen personas distintas

El proceso obliga a recorrer los estados, pero no impide que un Director editorial cree, envíe a revisión, apruebe y publique su propio registro. Tampoco bloquea la aprobación del contenido propio por un Editor.

**Práctica recomendada:** que la revisión y la publicación tengan responsables identificados y, cuando sea posible, personas diferentes. Es una regla organizativa sugerida; no debe presentarse como una restricción automática ya implementada.

<!-- page -->

## 13. Resolver dudas y problemas frecuentes

| Situación | Causa habitual | Qué hacer |
| --- | --- | --- |
| Soy Administrador y no veo Libros o Gaceta | Administración no concede permisos editoriales | Revisar una asignación adicional con rol, módulo y sección adecuados |
| Puedo leer un borrador ajeno, pero no editarlo | Lectura interna no implica edición de contenido ajeno | Solicitar que Dirección lo asigne a una cuenta Editor compatible |
| No aparece Publicar o está deshabilitado | Falta Dirección, alcance correcto o estado aprobado | Revisar Mi cuenta y el estado de la ficha |
| No puedo editar un registro en revisión | El estado bloquea la edición del contenido | Pedir correcciones para devolverlo a borrador |
| No puedo restaurar un archivado directamente a publicado | No es Gaceta archivada desde publicado | Volver a borrador y completar el flujo |
| Cambiaron mis roles y salí del sistema | Guardar la cuenta invalida sesiones anteriores | Iniciar sesión de nuevo |
| Se pide iniciar sesión para una acción sensible | La sesión no es reciente | Volver a autenticarse y repetir la acción |
| Aparece “El registro cambió” o un conflicto | Otra operación actualizó su versión | Conservar tus notas, recargar y revisar antes de guardar de nuevo |
| No aparece un borrador histórico en mi cuenta de Colaborador | No fue creado por esa cuenta o no conserva propietario conocido | Pedir que Dirección revise el registro; no atribuirlo por el nombre del autor |
| Se rechazó el acceso o hay demasiados intentos | Cuenta no activa, contraseña incorrecta o límite temporal | Revisar correo y estado; respetar la espera indicada y pedir ayuda si continúa |

### Preguntas rápidas

**¿Puedo destacar un borrador?** No. Solo se pueden agregar a destacados noticias publicadas y de una sección donde Dirección tenga alcance.

**¿Puede Consulta interna editar por recibir un enlace?** No. Un enlace no agrega permisos. Las rutas internas y las operaciones vuelven a comprobar la autorización.

**¿Quitar un rol elimina el contenido de esa persona?** No. Los cambios de acceso y el estado de las publicaciones se gestionan por separado.

**¿Por qué dos personas con el mismo rol ven cosas diferentes?** Pueden tener distintos módulos, secciones, autoría de registros o responsabilidades de edición.

**¿La pantalla Actividad de un registro es la auditoría general?** No. Actividad muestra sus transiciones editoriales. La auditoría general es una aplicación para Administración y la consulta actual devuelve las últimas 100 operaciones registradas.

<!-- page -->

## 14. Diccionario técnico: cuentas y sesiones

Este apartado permite relacionar el lenguaje del manual con los nombres del código. No es necesario memorizar los identificadores para usar el sistema.

### Permisos administrativos

Todos corresponden al rol **Administrador**. Las operaciones de cuentas también validan sus condiciones en el servicio del servidor.

| Identificador | Significado operativo |
| --- | --- |
| `users.read` | Listar cuentas y abrir sus fichas |
| `users.create` | Crear cuentas internas e invitaciones |
| `users.update` | Modificar los datos admitidos de una cuenta |
| `users.assign_roles` | Conceder o retirar asignaciones de rol y alcance |
| `users.disable` | Cambiar el estado de una cuenta, con protección del último administrador |
| `sessions.revoke` | Cerrar sesiones de una cuenta; la ruta de acceso también permite restablecerla |
| `audit.read` | Consultar auditoría general |

Crear una cuenta verifica creación y asignación de roles. Actualizarla verifica actualización, asignación de roles y cambio de estado. Los roles actuales conceden esos permisos administrativos como conjunto; la interfaz no ofrece casillas para inventar permisos individuales.

### Reglas de autenticación y protección

- **Cuenta activa:** una cuenta desactivada o pendiente de activación no puede trabajar con una sesión válida.
- **Ventana de sesión:** la sesión tiene una expiración renovable de 24 horas y un límite absoluto de siete días. La aplicación renueva al acercarse el vencimiento; puede ser necesario volver a ingresar antes del límite absoluto.
- **Revocación:** guardar cambios de cuenta, cerrar sesiones, cambiar contraseña o restablecer acceso invalida las sesiones previas afectadas.
- **Operaciones sensibles:** crear o modificar cuentas, revocar sesiones y restablecer acceso exigen una sesión iniciada hace no más de diez minutos.
- **Intentos de acceso:** el limitador actual admite diez intentos por correo y cincuenta por IP en ventanas de 15 minutos. También cuenta los accesos exitosos; una IP compartida puede afectar a varias personas.
- **Concurrencia:** la versión de la cuenta o del documento debe coincidir con la que se está guardando. Un conflicto exige recargar y revisar los cambios.

El control de permisos se realiza en el servidor. Ocultar un botón es una ayuda de navegación; no sustituye la comprobación de autorización de cada operación.

<!-- page -->

## 15. Diccionario de permisos editoriales

Los permisos editoriales siguen el formato `módulo.acción`, por ejemplo `gaceta.publish` o `libros.review`. La tabla describe las acciones genéricas; el servicio de cada módulo agrega el control de estado y documento.

| Acción interna | Roles que la incluyen | Aplicación real |
| --- | --- | --- |
| `read_internal` | Dirección, Editor, Consulta interna | Leer contenido interno del alcance |
| `read_own` | Colaborador | Leer registros creados por esa cuenta |
| `create` | Dirección, Editor, Colaborador | Crear borradores en el alcance |
| `edit_own` | Dirección, Editor, Colaborador | Editar registros propios, si el estado lo permite |
| `edit_assigned` | Dirección, Editor | Editor requiere asignación; Dirección puede editar dentro de su alcance |
| `review` | Dirección, Editor | Aprobar una revisión o pedir correcciones |
| `publish` | Dirección | Publicar contenido aprobado |
| `unpublish` | Dirección | Retirar a borrador desde aprobado, publicado o archivado |
| `archive` | Dirección | Archivar un registro no archivado |
| `assign` | Dirección | Asignar o quitar responsables compatibles |
| `feature` | Dirección | En Gaceta, gestionar noticias destacadas publicadas |
| `manage` | Dirección | Gestión auxiliar; por ejemplo, autores, investigadores, carrusel y colecciones |
| `submit` | Colaborador | Etiqueta definida en el rol; el envío efectivo a revisión comprueba permiso de edición del borrador |

### Particularidades que no deben generalizarse

- `gaceta.edit_published` y `gaceta.delete` se agregan exclusivamente a Dirección para Gaceta. No existe un equivalente de edición en vivo o eliminación habilitada para Libros e Investigaciones.
- Incluir una acción en el rol no significa que exista una pantalla para esa acción en todos los módulos. Los módulos auxiliares utilizan `manage`.
- Las rutas heredadas de artículos exigen `libros.read_internal` para leer y `libros.manage` para escribir o eliminar. No tienen el mismo control de estados de los catálogos de este manual; no deben usarse como evidencia de un flujo completo de revistas.
- No hay permisos personalizados por casilla, roles creados desde la interfaz, restricciones por colección o programa ni denegaciones individuales que anulen otros roles. Una operación se autoriza si una asignación válida la concede y se cumplen sus demás controles.

<!-- page -->

## 16. Acuerdos y mantenimiento del manual

### Propuesta de uso común

1. Utilizar siempre los cinco nombres oficiales del manual y explicar cada asignación con la fórmula **rol + módulos + secciones**.
2. Antes de conceder acceso, acordar las tareas que realizará la persona. Evitar Dirección cuando solo necesita redactar, revisar o consultar.
3. Definir quién redacta, quién revisa y quién publica cada tipo de contenido. La separación entre personas es una práctica del equipo, no una obligación automática del código.
4. Utilizar observaciones concretas al solicitar correcciones, retirar o archivar contenido.
5. Revisar accesos al cambiar funciones o terminar una colaboración. Revisar por separado los borradores pendientes y sus responsables.
6. Preferir archivar cuando se quiera conservar el registro. La eliminación de una noticia de Gaceta es definitiva desde el panel.

### Funciones que este manual no promete

El código revisado no ofrece publicación programada automática, MFA, recuperación automática por correo, versiones paralelas de contenido publicado, restauración completa de versiones ni un circuito editorial integrado de revistas externas. La protección de archivos históricos requiere una revisión específica de su almacenamiento.

### Lista para comprobar una asignación

- ¿La cuenta es de una persona concreta y está en el estado correcto?
- ¿El rol coincide con sus tareas reales?
- ¿Cada asignación contiene los módulos y las secciones necesarios?
- ¿Existe otra asignación que siga concediendo un acceso que se quiere retirar?
- ¿El documento exige propiedad, responsabilidad de edición o un estado específico?
- ¿La persona volvió a iniciar sesión después del cambio de permisos?

### Fuentes verificadas y actualización

El manual se contrastó con estas fuentes del proyecto, en la revisión indicada en la portada:

- `src/lib/security/roles.js`: catálogo de roles, acciones y alcances.
- `src/lib/security/editorial.js`, `newsStore.js` y `catalog.js`: reglas de contenido y estados.
- `src/lib/security/accounts.js`, `validation.js`, `store.js` y `src/lib/session.js`: reglas de cuentas y sesiones.
- `src/lib/security/routes.js`, `navigation.js`, `uploads.js` y APIs de cuentas, asignaciones, destacados y artículos: comprobaciones operativas.
- `docs/operacion-accesos.md` y `docs/interfaz-admin.md`: documentos complementarios.

Los documentos “plan” o propuestas futuras no sustituyen las reglas implementadas. Si cambian los roles o el flujo, actualizar las matrices, los ejemplos y este manual antes de distribuir una nueva edición.
