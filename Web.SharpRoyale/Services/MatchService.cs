using System.Collections.Concurrent;
using Core.SharpRoyale.GameServices.ActionListService;
using Core.SharpRoyale.GameServices.UserInteractionService;
using Engine.SharpRoyale;

namespace Web.SharpRoyale.Services;

public class MatchService(GameEngine engine)
{
    public ConcurrentDictionary<int, Match> _matches = new();
    private int _counter;

    public int CreateMatch((Player p1, Player p2) match)
    {
        var nextMatchId = Interlocked.Increment(ref _counter);
        var orderedPlayers = GetOrderedPlayers(match);

        var newMatch = new Match(matchId: nextMatchId, players: orderedPlayers);
        _matches.TryAdd(nextMatchId, newMatch);

        _ = engine.RunGameLoop(newMatch);

        return nextMatchId;
    }

    private static (Player p1, Player p2) GetOrderedPlayers((Player p1, Player p2) match)
    {
        bool mirrorFirstPlayer = Random.Shared.Next(2) == 0;

        if (mirrorFirstPlayer)
        {
            match.p1.IsMirrored = true;
            match.p2.IsMirrored = false;
            return (match.p2, match.p1);
        }

        match.p1.IsMirrored = false;
        match.p2.IsMirrored = true;
        return match;
    }

    public bool CheckMatchExists(int matchId)
    {
        return _matches.ContainsKey(matchId);
    }

    public Match GetMatchFromId(int matchId)
    {
        return _matches[matchId];
    }

    public bool SendPlayerActionToEngine(
        int matchId,
        int playerid,
        UserInteractionOption action,
        object values
    )
    {
        engine.AppendUserInteractionList(
            new UserInteractionElement(GetMatchFromId(matchId), playerid, action, values)
        );
        // TODO: Needs to be a Result instead
        return true;
    }
    
    public void DisconnectPlayerFromMatch(int matchId, int playerId)
    {
        GetMatchFromId(matchId).GetPlayerFromId(playerId).isConnected = false;
    }
}
