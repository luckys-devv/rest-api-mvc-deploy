import { validateMovie, validatePartialMovie } from '../schemas/movies.js'

export class MovieController {
  constructor( { movieModel } ){
    this.movieModel = movieModel
  }

  getAll = async (req, res) => {
    const { genre } = req.query
    const movies = await this.movieModel.getAll({ genre })
    res.json(movies)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const movie = await this.movieModel.getById({ id })

    if (!movie) return res.status(404).json({ error: 'Película no encontrada' })
    res.json(movie)
  }

  /**
   * POST /movies
   * Valida el body con Zod y crea una nueva película.
   */
  create = async (req, res) => {
    const result = validateMovie(req.body)

    // Si la validación falla, devolvemos 422 con los errores de Zod
    if (!result.success) {
      return res.status(422).json({ error: result.error.issues })
    }

    const newMovie = await this.movieModel.create({ input: result.data })
    res.status(201).json(newMovie) // 201 Created — devolvemos el recurso creado
  }

  /**
   * PATCH /movies/:id
   * Valida parcialmente el body y actualiza solo los campos enviados.
   */
  update = async (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
      return res.status(422).json({ error: result.error.issues })
    }

    const { id } = req.params
    const updatedMovie = await this.movieModel.update({ id, input: result.data })

    if (!updatedMovie) return res.status(404).json({ error: 'Película no encontrada' })
    res.json(updatedMovie)
  }

  /**
   * DELETE /movies/:id
   * Elimina una película. Devuelve 204 No Content si se borró correctamente.
   */
  delete = async (req, res) => {
    const { id } = req.params
    const deleted = await this.movieModel.delete({ id })

    if (!deleted) return res.status(404).json({ error: 'Película no encontrada' })
    res.status(204).send() // 204 No Content — éxito, sin cuerpo de respuesta
  }
}
