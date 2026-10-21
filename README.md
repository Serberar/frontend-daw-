# CineRent · Frontend (proyecto intermodular DAW)

Aplicación web en React para **alquilar películas online**: catálogo con filtro por géneros, carrito, registro con verificación de email, área de cliente y panel de administración.

El backend de usuarios y alquileres está en [backend-daw](https://github.com/Serberar/backend-daw).

## Páginas

| Ruta | Página |
|---|---|
| `/` | Catálogo de películas con destacadas y selector de géneros. |
| `/carrito` | Carrito de alquiler (días por película) y confirmación. |
| `/login` y `/register` | Acceso y registro. |
| `/verify-email` | Confirmación del email desde el enlace recibido. |
| `/cliente` | Mi cuenta: datos editables y películas alquiladas. |
| `/admin` | Panel de administración: alta y edición de películas y géneros. |

## Tecnologías

- React 18 con Create React App.
- React Router 6.
- Context API para el estado global (usuario, carrito, géneros).
- Axios para hablar con la API.

## Cómo arrancarlo

1. Crea un `.env` con la URL del backend:

   ```
   REACT_APP_BACK_URL=http://localhost:4000
   ```

2. Instala y arranca:

   ```bash
   npm install
   npm start      # http://localhost:3000
   ```

La app espera estas rutas en el backend: `/api/user/*` y `/api/product/rent` (en backend-daw), y `/api/movie/*` y `/api/genre` para el catálogo.

## Autor

Sergio Bernabé
