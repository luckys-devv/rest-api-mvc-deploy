import cors from 'cors'

const ACCEPTED_ORIGINS = [
  'http://localhost:1234',
  'http://localhost:3000',
  'http://localhost:8080'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin)) {
      return callback(null, true) // Si la origin esta en la lista, permitimos la peticion
    }

    if (!origin) {
      return callback(null, true) // Si no hay origin (postman, curl, etc) permitimos la peticion
    }

    return callback(new Error('No permitido by CORS')) // Si la origin no esta en la lista, bloqueamos la peticion
  }
})
