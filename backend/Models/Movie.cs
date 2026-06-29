namespace MovieApp.Api.Models;

public class Movie
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string MPAARating { get; set; } = default!;
    public int StarRating { get; set; }
    public List<Review> Reviews { get; set; } = new();
}
