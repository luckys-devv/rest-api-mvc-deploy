import { createApp } from './app.js' 
import { MovieModel } from './models/local/movies.js'

const app = createApp({ movieModel: MovieModel })

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})