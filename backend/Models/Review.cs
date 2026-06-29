namespace MovieApp.Api.Models;

public class Review
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public string Text { get; set; } = default!;
    public Movie? Movie { get; set; }
}
