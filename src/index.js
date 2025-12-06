import express from 'express'
import crypto  from 'node:crypto'
import movies  from './data/movies.json' with { type: 'json' }
import { validateMovie, validatePartialMovie } from './schemas/movies.js'


const app = express()
app.use(express.json()) // Middleware para parsear JSON - Gracias a esto podemos leer req.body
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.get('/movies', (req, res) => {
  const { genre } = req.query // En la qry tenemos un objeto con los query params
  if (genre) {
    const filteredMovies = movies.filter( // Filtramos por genero las peliculas
      m => m.genre.some(g => g.toLowerCase() === genre.toLowerCase()) // Comparamos ignorando mayusculas/minusculas
    )
    return res.json(filteredMovies)  
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(m => m.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ error: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
 
  const newMovie = {
    id: crypto.randomUUID(), // Generamos un id unico version 4
    ...result.data
  }
  // Esto no seria rest, porq guardamos el estado de la app
  movies.push(newMovie) 
  res.status(201).json(newMovie) // Avisamos que creamos el recurso con el 201 - Podemos devolver el recurso creado, para actualizar la cache del cliente
})

app.patch('/movies/:id', (req, res) =>{
  // Validamos los parametros que mandan
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  
  // Extraemos el id de la req, buscamos si la encuentra y luego validamos si existe
  const { id } = req.params // Extraemos la id de la req p
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if ( movieIndex === -1) {
    return res.status(404).json({ message: 'Pelicula no encontrada' })
  }

  const updateMovie = {
    ...movies[movieIndex], // Mantenemos los datos que ya tenia 
    ...result.data // Sobreescribimos con los datos que mandaron en la req  
  }

  movies[movieIndex] = updateMovie
  return res.json(updateMovie)
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

/**
 * POST: Crear un nuevo elemento/recurso en el servidor. NO ES IDEMPOTENTE (el resultado siempre es un nuevo recurso)
 * PUT: Actualizar totalemnte un elemento ya existente o crearlo sino existe. SI ES IDEMPOTENTE (resultado siempre mismol)
 * PATCH: Actualizar parcialmente un elemento/recurso ya existente. Normalmente NO ES IDEMPOTENTE (el resultado puede variar segun lo que se envie) 
 */
