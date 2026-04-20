import pg from 'pg'
const { Pool } = pg

// Lo se! Esto no va aca, pero es de prueba.
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '',
  database: 'postgres',
  port: 5432,
})

let BASE_SELECT_QRY = `SELECT 
                            m.id,
                            m.title, 
                            m.year,
                            m.director,
                            m.duration,
                            m.poster,
                            m.rate,
                            string_agg(g.name, ', ') AS generos
                         FROM movie m
                         LEFT JOIN movie_genre mg ON m.id = mg.movie_id
                         LEFT JOIN genre g ON g.id = mg.genre_id`

export class MovieModel {
  static async getAll ({ genre }) {
    let query = BASE_SELECT_QRY
    const queryParams = []

    if (genre) {
      query +=  ` WHERE m.id IN(      
                                SELECT movie_id 
                                  FROM movie_genre mg2
                                  JOIN genre g2 ON mg2.genre_id = g2.id
                                WHERE LOWER(g2.name) = $1)`
      queryParams.push(genre.toLowerCase())
    }
    query += ' GROUP BY m.id, m.title, m.year, m.director, m.duration, m.poster, m.rate'
    const { rows } = await pool.query(query, queryParams)
    return rows
  }
  
  static async getById ({ id }) {
    let query = BASE_SELECT_QRY
    query += ` WHERE m.id = $1 
               GROUP BY m.id, m.title, m.year, m.director, m.duration, m.poster, m.rate`

    const { rows } = await pool.query(query, [id])
    return rows[0] ?? null
  }

  static async create ({ input }) {
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre // Esto debería ser un array de IDs de géneros [1, 2]
    } = input

    const { rows } = await pool.query(
      `INSERT INTO movie (title, year, director, duration, poster, rate)
            VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [title, year, director, duration, poster, rate]
    )
    const newMovie = rows[0]
    // console.log(genre);
    
    if (genre && genre.length > 0) {
      for (const genreName of genre) {
        const { rows: genreRows } = await pool.query(
          'SELECT id FROM genre WHERE LOWER(name) = $1', [genreName.toLowerCase()]
        )
        // console.log(genreRows);
        if (genreRows[0]) {
          await pool.query(
            'INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2)', [newMovie.id, genreRows[0].id]
          )
        }
      }
    }
    return newMovie
  }

  static async update ({ id, input }) {
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre
    } = input

    const { rows } = await pool.query(
      `UPDATE movie
          SET title    = COALESCE($1, title),
              year     = COALESCE($2, year),
              director = COALESCE($3, director),
              duration = COALESCE($4, duration),
              poster   = COALESCE($5, poster),
              rate     = COALESCE($6, rate)
        WHERE id       = $7
      RETURNING *`,
      [title, year, director, duration, poster, rate, id]
    )

    if (rows.length === 0) return null

    if (genre !== undefined) {
      // Borramos las relaciones viejas y reinsertamos las nuevas (replace completo)
      await pool.query('DELETE FROM movie_genre WHERE movie_id = $1', [id])
      if (genre.length > 0) {
        for (const genreName of genre) {
          const { rows: genreRows } = await pool.query(
            'SELECT id FROM genre WHERE LOWER(name) = $1',
            [genreName.toLowerCase()]
          )
          if (genreRows[0]) {
            await pool.query(
              'INSERT INTO movie_genre (movie_id, genre_id) VALUES ($1, $2)',
              [id, genreRows[0].id]
            )
          }
        }
      }
    }
    return rows[0]
  }

  static async delete ({ id }) {
    // Gracias al "ON DELETE CASCADE" que configuramos en pgAdmin,
    // al borrar la película se borrarán solas las filas en movie_genre.
    const { rowCount } = await pool.query('DELETE FROM movie WHERE id = $1', [id])
    return rowCount > 0
  }
}