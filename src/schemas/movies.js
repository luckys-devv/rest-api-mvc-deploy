import z from 'zod' // Validaciones de datos

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'El titulo debe ser un texto',
    required_error: 'El titulo es obligatorio'
  }).min(1),
  genre: z.array(z.enum(['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Fantasy', 'Thriller', 'Sci-Fi', 'Documentary'])),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  director: z.string({
    invalid_type_error: 'El director debe ser un texto',
    required_error: 'El director es obligatorio'
  }).min(1),
  duration: z.number().int().min(0),
  rate: z.number().min(0).max(10).optional(),
  poster: z.url({ message: 'El poster debe ser una URL valida' })
})

export function validateMovie (object) {
  return movieSchema.safeParse(object)
}

export function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object) // Partial -> Hace que los campos sean opcionables, y los valida si vienen en la req
}
