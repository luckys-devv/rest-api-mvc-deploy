# 🎬 REST API — Movies

API REST construida con Node.js y Express siguiendo el patrón de arquitectura **MVC** con **Inyección de Dependencias**, permitiendo cambiar la base de datos sin modificar la logica del negocio. 

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Node.js** (ESM) | Runtime — módulos nativos con `import/export` |
| **Express 5** | Framework HTTP |
| **PostgreSQL** | Base de datos relacional |
| **node-postgres (pg)** | Driver de PostgreSQL para Node.js |
| **Zod** | Validación de esquemas y datos de entrada |
| **Standard JS** | Linter de código |

---

## 📁 Estructura del proyecto

```
src/
├── app.js                  # Factory de la app Express (sin listen)
├── server-pg.js            # Entry point → PostgreSQL
├── server-local.js         # Entry point → datos locales (JSON)
│
├── controllers/
│   └── movies.js           # Lógica HTTP: extrae params, valida, responde
│
├── models/
│   ├── pg/
│   │   └── movies.js       # Acceso a datos → PostgreSQL
│   └── local/
│       └── movies.js       # Acceso a datos → JSON en memoria
│
├── routes/
│   └── movies.js           # Define rutas y delega al Controller
│
├── schemas/
│   └── movies.js           # Esquemas de validación con Zod
│
├── middlewares/
│   └── cors.js             # Configuración de CORS
│
└── data/
    └── movies.json         # Dataset local (modo desarrollo)
```

---

## 💉 Inyección de Dependencias

El modelo de datos se inyecta desde el entry point, sin que el Controller sepa qué fuente de datos está usando:

```
server-pg.js    → createApp({ movieModel: MovieModel (pg) })
server-local.js → createApp({ movieModel: MovieModel (local) })
```

Para cambiar de base de datos, solo se modifica el `server-*.js`. El Controller y el Router no se tocan.

---

## 🚀 Instalación y uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/luckys-devv/rest-api-mvc-deploy.git
cd rest-api-mvc-deploy
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos (modo PostgreSQL)

Crear una base de datos en PostgreSQL y ejecutar el siguiente schema:

```sql
-- Tabla principal de películas
CREATE TABLE movie (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title    VARCHAR(255) NOT NULL,
  year     INTEGER NOT NULL,
  director VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  poster   TEXT NOT NULL,
  rate     NUMERIC(3,1)
);

-- Catálogo de géneros
CREATE TABLE genre (
  id   INTEGER PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Relación N:M entre películas y géneros
CREATE TABLE movie_genre (
  movie_id  UUID REFERENCES movie(id) ON DELETE CASCADE,
  genre_id  INTEGER REFERENCES genre(id),
  PRIMARY KEY (movie_id, genre_id)
);
```

### 4. Configurar la conexión (src/models/pg/movies.js)
```js
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'tu_contraseña',
  database: 'nombre_de_tu_bd',
  port: 5432,
})
```

> ⚠️ En un entorno real esto va en un archivo `.env`. Ver [Fase 3 — Variables de entorno](#roadmap).

### 5. Levantar el servidor

**Con PostgreSQL:**
```bash
npm run start:pg
```

**Con datos locales (JSON):**
```bash
npm run start:local
```

El servidor corre en `http://localhost:3000`

---

## 📡 Endpoints

### `GET /movies`
Devuelve todas las películas.

**Query params opcionales:**
- `genre` → filtra por género (ej: `/movies?genre=Action`)

**Respuesta `200`:**
```json
[
  {
    "id": "aae5b8b6-e213-43f2-bb45-ba5ceb06f161",
    "title": "The Matrix",
    "year": 1999,
    "director": "Lana Wachowski",
    "duration": 136,
    "poster": "https://...",
    "rate": "8.7",
    "generos": "Action, Sci-Fi"
  }
]
```

---

### `GET /movies/:id`
Devuelve una película por su UUID.

**Respuesta `200`:** objeto de la película  
**Respuesta `404`:** `{ "error": "Película no encontrada" }`

---

### `POST /movies`
Crea una nueva película.

**Body:**
```json
{
  "title": "Inception",
  "year": 2010,
  "director": "Christopher Nolan",
  "duration": 148,
  "poster": "https://url-del-poster.jpg",
  "genre": "Action",
  "rate": 8.8
}
```

**Respuesta `201`:** objeto de la película creada  
**Respuesta `422`:** errores de validación de Zod

---

### `PATCH /movies/:id`
Actualiza parcialmente una película. Solo es necesario enviar los campos a modificar.

**Body (ejemplo):**
```json
{
  "year": 2023,
  "rate": 9.1
}
```

**Respuesta `200`:** objeto actualizado  
**Respuesta `404`:** película no encontrada  
**Respuesta `422`:** errores de validación

---

### `DELETE /movies/:id`
Elimina una película por su UUID.

**Respuesta `204`:** sin contenido (éxito)  
**Respuesta `404`:** película no encontrada

---

## ✅ Validaciones (Zod)

| Campo | Tipo | Reglas |
|---|---|---|
| `title` | `string` | Requerido, mínimo 1 carácter |
| `genre` | `string` | Requerido |
| `year` | `number` | Entero, entre 1900 y año actual |
| `director` | `string` | Requerido, mínimo 1 carácter |
| `duration` | `number` | Entero, mínimo 0 |
| `rate` | `number` | Opcional, entre 0 y 10 |
| `poster` | `string` | URL válida |
