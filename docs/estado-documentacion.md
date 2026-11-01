# Revisión de documentación y pendientes de entrega

Revisión: 28 de octubre de 2026. Alcance: documentos de `docs/`, README, scripts de instalación/mantenimiento, rutas de la aplicación y archivos de pruebas del repositorio.

Esta revisión identifica cobertura documental. No constituye una nueva ejecución de las pruebas, una certificación de seguridad ni una aceptación del despliegue de producción. La documentación debe asociarse al commit o etiqueta que finalmente se entregue.

## 1. Evaluación general

La documentación cubre instalación, inicialización, estructura de datos, autenticación, autorización y operación de referencia. Para una entrega completa y mantenible faltan principalmente la guía funcional detallada por módulo, la arquitectura del código, el contrato de las APIs y los registros de validación y entrega de una versión concreta.

No hace falta otro manual de despliegue que repita los existentes. Sí hace falta completar las decisiones institucionales que los manuales no pueden resolver sin conocer la infraestructura de la universidad.

## 2. Matriz de cobertura actual

| Tema | Estado documental | Evidencia y pendiente |
| --- | --- | --- |
| Entorno de desarrollo | Cubierto | [Manual de desarrollo](manual-desarrollo.md): requisitos, variables, Node/Docker, pruebas, almacenamiento y errores frecuentes. |
| Instalación nueva y población | Cubierto | [Inicialización](instalacion-inicial.md), `scripts/bootstrap.js` y `scripts/demo-data.js`: cuenta inicial, ejemplos opcionales, preservación y reanudación. |
| Despliegue en producción | Guía cubierta; configuración institucional pendiente | [Manual de producción](manual-produccion.md): arquitectura de referencia, TLS, secretos, persistencia y operación. Completar dominio, plataforma, imágenes y responsables, y probar la adaptación real. |
| Bases, documentos y relaciones | Cubierto | [Estructura de datos](estructura-base-datos.md): inventario, campos, relaciones, índices, archivos y eventos. |
| Login, cuentas, roles y permisos | Cubierto | [Manual de roles](manual-roles-permisos.md) y [operación de accesos](operacion-accesos.md). Incluyen matrices, ejemplos y limitaciones. |
| Flujo editorial y cambios de estado | Cubierto | El manual de roles diferencia Gaceta, Libros e Investigaciones y sus acciones permitidas. |
| Interfaz y trabajo diario | Parcial | [Interfaz administrativa](interfaz-admin.md) y manual de roles describen comportamiento y flujo general; faltan instrucciones completas de formularios y módulos auxiliares. |
| Migración desde datos anteriores | Procedimiento cubierto; ejecución de entrega pendiente | Operación de accesos explica simulación y aplicación. Registrar respaldo, resultados y validación de la migración que efectivamente se realice. |
| Auditoría y logs | Cubierto | Diccionario de acciones, interpretación y límites en estructura de datos; operación técnica en producción. |
| Respaldos, restauración y retorno de versión | Procedimiento de referencia cubierto | Falta concretar herramienta, ubicación, frecuencia, retención y evidencia de recuperación con el equipo de servidores. |
| Arquitectura general y organización del código | Parcial | Producción describe servicios y datos enlaza archivos principales. Falta un documento integrado de componentes, responsabilidades y recorrido de una petición. |
| Contrato de APIs | Pendiente como documento específico | Existen rutas en `src/pages/api/` y pruebas HTTP; falta un catálogo con entradas, respuestas, permisos y errores. |
| Integraciones externas | Parcial | Se aclara que REMI es externo. Falta describir su consulta, dependencias y comportamiento ante cambios o fallos. |
| Plan y resultados de pruebas | Parcial | Hay pruebas automatizadas y comandos documentados. Falta una matriz funcional y un reporte asociado a la versión de entrega. |
| Historial de versiones y cambios | Pendiente como registro de entregas | No se identificó un `CHANGELOG.md` en el repositorio. El plan de roles describe el planteamiento inicial, no sustituye un historial de versiones. |
| Soporte y entrega institucional | Parcial | Producción define responsabilidades de referencia. Faltan contactos, acuerdos operativos y acta de recepción completados. |
| Licencia del código | Existe | El repositorio contiene `LICENSE` con licencia MIT. Falta explicitar por separado el tratamiento de libros, fotografías y demás contenido editorial según los acuerdos institucionales. |

## 3. Documentos que conviene completar primero

### Prioridad 1: uso del sistema y recepción de la entrega

**A. Manual funcional por módulo** — propuesta: `manual-usuario.md`.

Audiencia: personas que cargan, revisan y publican contenido. Complementa el manual de roles con instrucciones de pantalla, sin duplicar toda la matriz de permisos.

Contenido mínimo:

- Entrar, activar cuenta, cambiar contraseña y reconocer las aplicaciones disponibles.
- Crear y editar noticias: campos, secciones, contenido, imágenes, autores y vista previa.
- Gestionar portada y destacadas; explicar qué selección cambia cada vista pública.
- Crear y actualizar libros: metadatos, colección, portada, PDF y validaciones.
- Crear y actualizar investigaciones y sus relaciones con perfiles/programas según el formulario vigente.
- Gestionar autores públicos, investigadores y carrusel; distinguir perfiles públicos de cuentas de acceso.
- Buscar y filtrar; interpretar barra de estados y confirmaciones.
- Corregir errores frecuentes, conflictos de edición y restricciones de archivos.
- Consultar contenido público y distinguir qué funcionalidades pertenecen a REMI.

Incluir capturas de una versión identificada con datos ficticios, pasos numerados y resultado esperado. No presentar botones o procesos que todavía no existan.

**B. Plan de pruebas funcionales y aceptación** — propuesta: `plan-pruebas-aceptacion.md`.

Audiencia: equipo del proyecto, usuarios que validan y equipo receptor.

Cada caso debe registrar ID, requisito/función, rol, precondiciones, pasos, resultado esperado, resultado obtenido, evidencia y versión probada. Cubrir al menos:

- Instalación vacía con y sin ejemplos, reinicio sin duplicados y preservación de cuentas.
- Activación, login/logout, cambio de contraseña, desactivación y revocación de sesiones.
- Separación de permisos por módulo, sección y relación con el contenido.
- Creación y flujo editorial de Gaceta, Libros e Investigaciones.
- Visibilidad pública y protección de archivos nuevos al publicar/retirar contenido.
- Autores, investigadores, carrusel, portada y destacadas.
- Migración, HTTPS real y restauración en el entorno receptor.

Separar las pruebas automatizadas de las verificaciones manuales. Registrar resultados reales; una lista de pruebas existentes no demuestra que todas pasaron para el commit entregado.

**C. Lista y acta de entrega técnica** — propuesta: `entrega-tecnica.md`.

Contenido mínimo: versión/commit, imágenes, documentos entregados, instalación vacía o migrada, respaldo de corte, aceptación, incidencias abiertas, responsables y fecha de recepción. Referenciar el registro institucional del manual de producción en lugar de mantener valores contradictorios.

### Prioridad 2: mantenimiento por otro equipo de desarrollo

**D. Arquitectura y guía del código** — propuesta: `arquitectura-sistema.md`.

Explicar Astro SSR, componentes Vue, estilos, rutas, middleware, sesiones, autorización y acceso a CouchDB. Incluir estructura de carpetas y un recorrido concreto: formulario → API → validación → permiso → documento/archivo → auditoría → respuesta. Aclarar dónde agregar módulos, validaciones y pruebas, y qué componentes visuales reutilizar.

**E. Referencia de APIs** — propuesta: `api.md` o una especificación OpenAPI mantenida con el código.

Inventariar las rutas existentes y documentar, por operación: método, URL, finalidad, autenticación, permiso/alcance, parámetros, cuerpo, respuesta, errores y ejemplo. Incluir origen requerido para escrituras, uso de cookie, control de revisión y subida/lectura de archivos. Diferenciar lectura pública, interna y rutas heredadas.

No publicar ejemplos con tokens, cookies o credenciales reales. No asumir que todas las rutas siguen un contrato uniforme: documentar lo que cada una implementa.

**F. Integraciones y dependencias externas** — sección en arquitectura o archivo `integraciones.md`.

Actualmente `src/pages/api/remi/obtener_revista.js` consulta una URL de número concreto de REMI y extrae información de su HTML. Documentar la URL configurada en código, selectores relevantes, información obtenida, responsable de actualización y cómo verificar fallos del servicio o cambios de estructura. No describirlo como una sincronización editorial completa ni como gestión de cuentas de la plataforma de revistas.

### Prioridad 3: continuidad documental

**G. Historial de entregas y limitaciones** — propuesta: `CHANGELOG.md` y una sección de limitaciones vigentes.

Por versión: fecha, cambios relevantes para usuarios, cambios técnicos, migraciones necesarias y limitaciones. Consolidar las limitaciones ya documentadas, por ejemplo ausencia de envío automático de correos, MFA, publicación programada y control retroactivo de todos los archivos históricos. Distinguir una mejora futura de un defecto conocido y registrar su impacto real.

**H. Guía de contribución y mantenimiento** — propuesta: `CONTRIBUTING.md`.

Indicar cómo preparar un cambio, estrategia de ramas acordada, pruebas requeridas según el alcance, revisión y actualización de documentación. Estos acuerdos deben reflejar la práctica del equipo, no imponer un proceso que todavía no se haya acordado.

## 4. Acuerdos que debe completar la universidad

Estos asuntos están previstos por los documentos existentes, pero necesitan valores y responsables reales:

| Acuerdo | Entregable verificable |
| --- | --- |
| Infraestructura y HTTPS | Dominio, red, proxy, certificados, renovación e imágenes aprobadas; prueba de login y formularios desde la URL pública. |
| Secretos y cuenta de servicio | Custodia y recuperación; definición de la separación entre credenciales de inicialización y ejecución. El Compose actual comparte el administrador CouchDB con frontend. |
| Respaldos y recuperación | Herramienta, destino, frecuencia, retención, objetivos de recuperación y registro de una restauración probada. |
| Monitoreo y soporte | Alertas, contactos, responsable que atiende, canal de reporte y escalamiento entre infraestructura y equipo funcional. |
| Administración editorial | Personas responsables de cuentas, asignación de roles y validación de contenidos. |
| Contenido y datos personales | Acuerdos institucionales sobre publicación de fotografías, datos de autores/investigadores, derechos de obras y conservación de actividad. El aviso aplicable debe definirlo la institución. |

Una política institucional no queda aprobada por incluir un borrador en el repositorio. Las credenciales, enlaces privados y copias de datos se gestionan fuera de la documentación pública.

## 5. Orden recomendado y criterio de cierre

1. Completar manual funcional y casos de aceptación con la interfaz vigente.
2. Documentar arquitectura, APIs e integración REMI para que otro equipo pueda mantener el código.
3. Identificar una versión de entrega, ejecutar las pruebas y registrar resultados e incidencias.
4. Completar con servidores los datos operativos y probar instalación/migración y restauración en preproducción.
5. Formalizar la entrega, registrar responsables y establecer quién actualizará cada documento.

No se necesita un archivo separado por cada tema: arquitectura e integraciones pueden convivir; aceptación y acta pueden formar una carpeta de entrega. Lo importante es que cada público encuentre instrucciones verificables y que los registros indiquen qué versión describen.

El paquete puede considerarse listo para una entrega cuando permite a una persona nueva instalarlo, a un usuario operar sus módulos, a otro desarrollador modificarlo, y al equipo de servidores respaldarlo, recuperarlo y atender incidencias, con las limitaciones conocidas expresamente registradas.
