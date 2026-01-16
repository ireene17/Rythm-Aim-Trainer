# Rythm Aim Trainer - Videojuego Web para practicar la puntería

Proyecto de Fin de Grado para poner en prueba los conocimientos aprendidos en el curso. En este caso de **react**, **node.js** y **mongoDB**, entre otros.

---

## Características 

* **Arquitectura**: Sigue una arquitectura SPA para el frontend y MVC para el backend.
* **Modos de Juego**:
    * Individual: El usuario podrá jugar a todos los modos de juego y sus estadísticas quedarán guardadas.
    * Multijugador: El usuario podrá jugar con otros jugadores mediante un código de invitación a la sala, además de contra "bots".
* **Estadísticas del jugador**: Indicador de precisión, habilidades, tiempo de reacción, consejos, mejores y peores mapas, historial, etc. para que el jugador analice sus "pros" y "contras".
* **Personalización del panel Usuario**: Donde el jugador podrá editar su descripción, panel y foto de perfil.
* **Ranking Global**: Donde la puntuación de todos los usuarios aparecerá en orden descendente para conocer a los mejores jugadores de la plataforma.
* **Diversidad de Mapas**: Para practicar diferentes ámbitos de la puntería
* **Hasta 7 dificultades**: Para una mejora incremental en los jugadores y desafiar al máximo las habilidades de cada uno.
* **Ajustes generales**: Opción de regular el volumen en caso de ser necesario

## Tecnologías

* **Frontend**:
  * React: librería para la estructura general. La interfaz del usuario y gestión
de la aplicación de manera eficiente.
  * Phaser: framework usado únicamente para las escenas del videojuego
  * Tailwind y CSS: Tailwind es un framework con utilidades de CSS para el
diseño
  * TypeScript como lenguaje de programación
  * Vite: utilizado para el despliegue.
* **Backend**:
  * Node.js: para ejecutar el código del Backend y gestionar peticiones HTTP.
    También permite conectarse con la base de datos.
  * Express: framework para crear rutas de forma rápida y ordenada.
  * TypeScript como lenguaje de programación
* **Base de datos**:
  * MongoDB: base de datos NoSQL que usa colecciones y documentos en
    formato JSON. Toda la información de la página web se encuentra aquí (los
    usuarios junto con sus estadísticas y los mapas)
  * Mongoose: librería para facilitar las operaciones con la base de datos
* **Integración y pruebas**:
  * Thunder Client para peticiones a la API REST (para los endpoints)
  * Console.logs, consola de navegador y terminal de VisualStudioCode
* **Seguridad**:
  * CORS para restringir el acceso al backend (solo permitir las peticiones de
    localhost:3001 a localhost:5173)
  * Bcrypt para la encriptación de contraseñas
  * JWT para identificar a los usuarios una vez autenticados
  * Validación en los formularios para garantizar que los valores son correctos
    antes de enviarlos al servidor

## Estructura de Navegación

### Inicio
- **Menú Inicio**
  - **Modos de juego**
    - **Modo individual**
      - Mixto  
        - Mapas y comienzo de partida
      - Flicks  
        - Mapas y comienzo de partida
      - Tracking  
        - Mapas y comienzo de partida
      - Reflejos  
        - Mapas y comienzo de partida

    - **Modo Multijugador**
      - Unirse a una sala
        - Introducir código
          - Sala de espera
            - Comienzo de partida
      - Crear una sala
        - Selección de mapa
          - Sala de espera
            - Comienzo de partida

  - **Ranking y Estadísticas**
    - Ranking

  - **Configuración de Usuario**
    - Perfil de Usuario

  - **Registro / Login**

---

### Configuración
- Iniciar sesión
- Configurar cuenta
  - Cerrar sesión
  - Volver atrás
- Ajustes generales
  - Ajustes de volumen
- Volver a Inicio
  - Menú Inicio

---

### Perfil de Usuario
- Según si está registrado o no  
  - Login  
  - Configuración de Usuario


## Instalación y Uso
**Clona este repositorio**
Para desplegar este proyecto bastará con tener la base de datos y la carpeta de este.
En primer lugar, añadiremos la base de datos a nuestro mongoDB utilizando el
siguiente comando:
```
mongorestore --uri="mongodb://localhost:27017" --archive=rythmaimtrainer.archive
```
Una vez la tengamos, iremos abriremos la terminal en la ruta de la carpeta del proyecto
/proyecto-tfg-react-phaser-nodejs
y una vez aquí, iremos a:
/proyecto-tfg-react-phaser-nodejs/client
/proyecto-tfg-react-phaser-nodejs/server
y en ambas escribiremos en la terminal:
```
npm install
```
Iniciaremos el servidor (/ proyecto-tfg-react-phaser-nodejs/server) con el comando:
```
npm start
```
E iniciaremos el cliente (/proyecto-tfg-react-phaser-nodejs/client)
con el comando:
```
npm run dev
```
## Aprendizaje

Aprendizajes más amplios en
estructuración de datos por el uso de mongoose y mongodb; implementación de lógica
para encontrar soluciones, crear funciones y realizar la gestión del juego de una manera
óptima o viable; nuevas técnicas de diseño para crear animaciones y cargar contenido
dinámicamente. Aprendizaje del uso del Framework Phaser y mejora de habilidades en React y Node.js.

### Autora
Proyecto creado por **Irene Smykla Jiménez** para el aprendizaje de un desarrollo web full stack

### Imágenes
**Inicio:**
