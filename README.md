# Página Web CIMU (Centro de Investigaciones Multidisciplinarias)

Un sitio web desarrollado con Astro para el Centro de Investigaciones Multidisciplinarias (CIMU). El sistema permite visualizar información del centro, investigadores, publicaciones y programas de investigación. Además, cuenta con un panel de administración para gestionar el contenido dinámico.

## 🚀 Tecnologías Utilizadas

- **Framework:** [Astro](https://astro.build/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) y [DaisyUI](https://daisyui.com/)
- **Componentes Reactivos:** [Vue.js](https://vuejs.org/) (para componentes interactivos y editor Markdown)
- **Base de Datos:** [CouchDB](https://couchdb.apache.org/)
- **Peticiones HTTP:** Axios
- **Autenticación:** Bcrypt para encriptación de contraseñas y manejo de sesiones seguro
- **Gestión de Contenido:** `md-editor-v3` y `markdown-it` para la creación de artículos y gacetas
- **Carrusel y UI:** Swiper, @vavt/cm-extension

## 📦 Estructura del Proyecto

El proyecto sigue la estructura estándar de Astro, con una organización modular para componentes y lógica de negocio:

```text
/
├── public/               # Archivos estáticos accesibles públicamente
├── src/
│   ├── assets/           # Imágenes y recursos gráficos (optimizados por Astro)
│   ├── components/       # Componentes de UI modulares divididos por sección (inicio, admin, etc.)
│   ├── layouts/          # Layouts base (Header, Footer, estructura HTML)
│   ├── lib/              # Lógica de backend (conexión a CouchDB, modelos de datos, autenticación)
│   ├── pages/            # Enrutamiento basado en archivos (incluye endpoints API de Astro y panel /admin)
│   ├── scripts/          # Lógica JavaScript de cliente
│   └── styles/           # Estilos globales
├── .env                  # Variables de entorno (no incluido en el repositorio)
├── astro.config.mjs      # Configuración de Astro e integraciones
├── middleware.js         # Middleware para protección de rutas de administrador
└── package.json          # Dependencias y scripts
```

## ⚙️ Requisitos Previos

- **Node.js**: Versión 18+ o superior.
- **CouchDB**: Instancia local o remota en funcionamiento.

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio:**

   ```bash
   git clone <url-del-repositorio>
   cd cimu
   ```

2. **Instalar las dependencias:**

   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto para conectar la base de datos y otras configuraciones. Ejemplo:

   ```env
   COUCHDB_URL=http://localhost:5984
   COUCHDB_USER=admin
   COUCHDB_PASSWORD=secret
   # Añade otras variables requeridas por el entorno
   ```

4. **Ejecutar el entorno de desarrollo:**
   ```bash
   npm run dev
   ```
   El sitio estará disponible en `http://localhost:4321`.

## 🧞 Scripts de NPM

| Comando           | Acción                                         |
| :---------------- | :--------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo local         |
| `npm run build`   | Compila el sitio para producción en `./dist/`  |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm start`       | Ejecuta la aplicación utilizando Node (SSR)    |

## 🛡️ Panel de Administración

El sitio cuenta con una ruta privada (`/admin`) protegida por un middleware de Astro (`middleware.js`). Desde el panel, los administradores pueden gestionar:

- **Investigadores:** Perfiles y roles (Directivos, etc.).
- **Investigaciones y Publicaciones:** Control de artículos, proyectos y revistas (Gaceta, REMI).
- **Librería (Editorial):** Gestión de libros.
- **Página de Inicio:** Carrusel de imágenes destacadas.

Las peticiones desde el cliente hacia la base de datos interactúan mediante endpoints alojados en `src/pages/api/` y los controladores en `src/lib/`.

## 📝 Notas de Base de Datos

La aplicación consume datos de colecciones específicas en CouchDB. Es necesario crear las bases de datos e inicializar los primeros usuarios con permisos de administrador en CouchDB para poder acceder al sistema web.
