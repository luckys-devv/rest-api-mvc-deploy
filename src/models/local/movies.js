import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const movies = JSON.parse(
  await readFile(new URL('../../data/movies.json', import.meta.url))
)

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      return movies.filter(
        m => m.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
    }
    return movies
  }

  static async getById ({ id }) {
    const movie = movies.find(m => m.id === id)
    return movie ?? null // ?? → nullish coalescing: retorna null si no encuentra
  }

  static async create ({ input }) {
    const newMovie = {
      id: randomUUID(), // UUID v4 nativo de Node 
      ...input // Spread: copiamos todos los campos validados (title, genre, etc.)
    }
    movies.push(newMovie)
    return newMovie
  }

  static async update ({ id, input }) {
    const index = movies.findIndex(m => m.id === id)
    if (index === -1) return null // Retornamos null → el Controller decide el status HTTP

    const updatedMovie = {
      ...movies[index], // Mantenemos todos los campos originales
      ...input          // Pisamos solo los que vienen en el body
    }
    movies[index] = updatedMovie
    return updatedMovie
  }

  static async delete ({ id }) {
    const index = movies.findIndex(m => m.id === id)
    if (index === -1) return false // false → el Controller responde 404

    movies.splice(index, 1)
    return true
  }
}
