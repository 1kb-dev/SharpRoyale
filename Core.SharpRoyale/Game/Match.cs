using Core.SharpRoyale.GameServices.ActionListService;

namespace Core.SharpRoyale;

public class Match
{
    public int MatchId { get; }
    public (Player p1, Player p2) Players { get; }
    public ArenaMap Map { get; }
    public List<ActionElement> ActionList { get; } = [];
    public List<ActionElementResult> ActionListResult { get; } = [];
    public int? WinnerPlayerId { get; set; } = null;

    private int _nextEntityId;

    public Match(int matchId, (Player p1, Player p2) players)
    {
        MatchId = matchId;
        Players = players;
        Map = new ArenaMap().AddPlayerTowers(players, this);
    }

    public int GetNextEntityId()
    {
        _nextEntityId++;
        return _nextEntityId - 1;
    }

    public Player GetPlayerFromId(int id)
    {
        if (Players.p1.Id == id)
            return Players.p1;
        else if (Players.p2.Id == id)
            return Players.p2;
        else
            Environment.FailFast($"Player with ID {id} does not exist in this match.");
        return null;
    }
}
