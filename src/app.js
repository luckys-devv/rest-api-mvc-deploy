import express from 'express'
import { createMovieRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'


// Podemos inyectar el modelo de datos, bien alejado de la logica
export const createApp = ({ movieModel }) => {
  const app = express()
  app.use(express.json()) // Middleware para parsear JSON - Gracias a esto podemos leer req.body
  app.use(corsMiddleware())
  app.disable('x-powered-by')
  
  app.use('/movies', createMovieRouter({ movieModel })) 
  
  return app
}
