using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApp.Api.Data;
using MovieApp.Api.Models;

namespace MovieApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MoviesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<Movie>>> GetAll()
    {
        return await _db.Movies.Include(m => m.Reviews).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Movie>> Get(int id)
    {
        var movie = await _db.Movies.Include(m => m.Reviews).FirstOrDefaultAsync(m => m.Id == id);
        return movie is null ? NotFound() : movie;
    }

    [HttpPost]
    public async Task<ActionResult<Movie>> Create(MovieCreateDto dto)
    {
        var movie = new Movie
        {
            Name = dto.Name,
            MPAARating = dto.MPAARating,
            StarRating = dto.StarRating
        };

        _db.Movies.Add(movie);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = movie.Id }, movie);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, MovieCreateDto dto)
    {
        var movie = await _db.Movies.FindAsync(id);
        if (movie is null)
        {
            return NotFound();
        }

        movie.Name = dto.Name;
        movie.MPAARating = dto.MPAARating;
        movie.StarRating = dto.StarRating;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var movie = await _db.Movies.FindAsync(id);
        if (movie is null)
        {
            return NotFound();
        }

        _db.Movies.Remove(movie);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/reviews")]
    public async Task<ActionResult<List<Review>>> GetReviews(int id)
    {
        if (!await _db.Movies.AnyAsync(m => m.Id == id))
        {
            return NotFound();
        }

        return await _db.Reviews.Where(r => r.MovieId == id).ToListAsync();
    }

    [HttpPost("{id}/reviews")]
    public async Task<ActionResult<Review>> AddReview(int id, ReviewCreateDto dto)
    {
        var movie = await _db.Movies.FindAsync(id);
        if (movie is null)
        {
            return NotFound();
        }

        var review = new Review
        {
            MovieId = id,
            Text = dto.Text
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetReviews), new { id }, review);
    }

    public class MovieCreateDto
    {
        public string Name { get; set; } = default!;
        public string MPAARating { get; set; } = default!;
        public int StarRating { get; set; }
    }

    public class ReviewCreateDto
    {
        public string Text { get; set; } = default!;
    }
}
