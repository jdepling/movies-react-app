import { useEffect, useState } from 'react';

const mpaaOptions = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

const makeStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

function App() {
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState('list');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({ id: null, name: '', mpaaRating: 'PG', starRating: 3 });
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (!response.ok) throw new Error('Could not load movies');
      setMovies(await response.json());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const loadMovie = async (movie) => {
    const response = await fetch(`/api/movies/${movie.id}`);
    if (!response.ok) return;
    setSelectedMovie(await response.json());
    setView('detail');
  };

  const saveMovie = async (event) => {
    event.preventDefault();
    const payload = {
      name: movieForm.name,
      mpaaRating: movieForm.mpaaRating,
      starRating: Number(movieForm.starRating)
    };

    const method = movieForm.id ? 'PUT' : 'POST';
    const url = movieForm.id ? `/api/movies/${movieForm.id}` : '/api/movies';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setError('Unable to save movie');
      return;
    }

    await loadMovies();
    setMovieForm({ id: null, name: '', mpaaRating: 'PG', starRating: 3 });
    setView('list');
    setError('');
  };

  const deleteMovie = async (movie) => {
    if (!window.confirm(`Delete '${movie.name}'?`)) return;
    const response = await fetch(`/api/movies/${movie.id}`, { method: 'DELETE' });
    if (response.ok) {
      await loadMovies();
      if (selectedMovie?.id === movie.id) {
        setSelectedMovie(null);
        setView('list');
      }
    }
  };

  const startNewMovie = () => {
    setMovieForm({ id: null, name: '', mpaaRating: 'PG', starRating: 3 });
    setView('new');
  };

  const startEditMovie = (movie) => {
    setMovieForm({ id: movie.id, name: movie.name, mpaaRating: movie.mpaaRating, starRating: movie.starRating });
    setView('edit');
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!selectedMovie) return;

    const response = await fetch(`/api/movies/${selectedMovie.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: reviewText })
    });

    if (!response.ok) {
      setError('Unable to save review');
      return;
    }

    const refreshed = await fetch(`/api/movies/${selectedMovie.id}`);
    if (refreshed.ok) {
      setSelectedMovie(await refreshed.json());
      setReviewText('');
      setError('');
      await loadMovies();
    }
  };

  return (
    <div className="app-shell">
      <header>
        <h1>Movie Manager</h1>
      </header>

      {error && <div className="error-box">{error}</div>}

      {view === 'list' && (
        <section>
          <div className="list-toolbar">
            <button onClick={startNewMovie}>Add Movie</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>MPAA</th>
                <th>Stars</th>
                <th>Reviews</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td>{movie.name}</td>
                  <td>{movie.mpaaRating}</td>
                  <td>{makeStars(movie.starRating)}</td>
                  <td>{movie.reviews?.length ?? 0}</td>
                  <td className="actions">
                    <button onClick={() => loadMovie(movie)}>Details</button>
                    <button onClick={() => startEditMovie(movie)}>Edit</button>
                    <button onClick={() => deleteMovie(movie)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {(view === 'new' || view === 'edit') && (
        <section>
          <h2>{view === 'new' ? 'Add Movie' : 'Edit Movie'}</h2>
          <form onSubmit={saveMovie} className="movie-form">
            <label>
              Name
              <input
                value={movieForm.name}
                onChange={(e) => setMovieForm({ ...movieForm, name: e.target.value })}
                required
              />
            </label>
            <label>
              MPAA Rating
              <select
                value={movieForm.mpaaRating}
                onChange={(e) => setMovieForm({ ...movieForm, mpaaRating: e.target.value })}
              >
                {mpaaOptions.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Star Rating
              <select
                value={movieForm.starRating}
                onChange={(e) => setMovieForm({ ...movieForm, starRating: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setView('list')}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {view === 'detail' && selectedMovie && (
        <section>
          <button className="back-button" onClick={() => setView('list')}>
            ← Back to List
          </button>
          <h2>{selectedMovie.name}</h2>
          <p>
            <strong>MPAA Rating:</strong> {selectedMovie.mpaaRating}
          </p>
          <p>
            <strong>Stars:</strong> {makeStars(selectedMovie.starRating)}
          </p>
          <div className="review-panel">
            <h3>Reviews</h3>
            {selectedMovie.reviews?.length ? (
              <ul>
                {selectedMovie.reviews.map((review) => (
                  <li key={review.id}>{review.text}</li>
                ))}
              </ul>
            ) : (
              <p>No reviews yet.</p>
            )}
            <form onSubmit={submitReview} className="review-form">
              <label>
                Add a Review
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Submit Review</button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
