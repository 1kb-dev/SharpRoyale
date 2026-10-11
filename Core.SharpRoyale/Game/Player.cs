namespace Core.SharpRoyale;

public class Player(int id)
{
    public int Id { get; } = id;
    public Deck? Deck { get; set; }
    public int Elixir = 0;
    public bool IsMirrored = false;
    public bool isConnected = true;
}
