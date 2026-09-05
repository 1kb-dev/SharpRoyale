using System.Security.Claims;
using Core.SharpRoyale.GameServices.UserInteractionService;
using Engine.SharpRoyale;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Web.SharpRoyale.Infrastructure;

namespace Web.SharpRoyale.Hubs;

[Authorize]
public class MatchHub(MatchService matchService) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var matchId = GetMatchIdFromRoute(Context.GetHttpContext());
        if (!matchService.CheckMatchExists(matchId))
            return;
            //throw new HubException("match_not_found");

        await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{matchId}");

        await base.OnConnectedAsync();
    }

    public Task JoinMatch(int matchId)
    {
        if (matchService.CheckMatchExists(matchId))
        {
        }

        return Task.CompletedTask;
    }

    private static int GetMatchIdFromRoute(HttpContext? httpContext)
    {
        var routeValue = httpContext?.Request.RouteValues["matchId"]?.ToString();
        if (!int.TryParse(routeValue, out var matchId))
            throw new HubException("invalid_match_id");

        return matchId;
    }

    private static int GetPlayerId(ClaimsPrincipal? user)
    {
        var idValue = user?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idValue) || !int.TryParse(idValue, out var playerId))
        {
            throw new HubException("invalid_player_id");
        }

        return playerId;
    }

    public record Result(bool Success, string? Error = null)
    {
        public static Result Ok() => new(true);

        public static Result Fail(string error) => new(false, error);
    }

    public Result SendPlayerAction(string action, object values)
    {
        UserInteractionOption? userInteractionOption = MatchUserInteractionOption(action);
        int playerId = GetPlayerId(Context.User);

        if (userInteractionOption == null)
        {
            Console.WriteLine("FAILED UI OPTION");
            return Result.Fail("Invalid Action Option");
        }

        if (playerId <= 0)
        {
            Console.WriteLine($"player is {GetPlayerId(Context.User)}");
            Console.WriteLine("player not assigned");
            return Result.Fail("Player not assigned");
        }
        if (GetMatchIdFromRoute(Context.GetHttpContext()) <= 0)
            return Result.Fail("Match not assigned");

        matchService.SendPlayerActionToEngine(
            GetMatchIdFromRoute(Context.GetHttpContext()),
            playerId,
            userInteractionOption.Value,
            values
        );

        return Result.Ok();
    }

    private UserInteractionOption? MatchUserInteractionOption(string action)
    {
        if (Enum.TryParse<UserInteractionOption>(action, true, out var option))
            return option;

        return null;
    }

    public record struct PlayerInfo(int PlayerId, int MatchId, bool IsMirrored);
    public PlayerInfo GetPlayerInfo()
    {
        int playerId = GetPlayerId(Context.User);
        bool playerIsMirrored = false;
        int matchId = 0;
        foreach (Match match in matchService._matches.Values)
        {
            if (match.Players.p1.Id == playerId)
            {
                playerIsMirrored = match.Players.p1.IsMirrored;
                matchId = match.MatchId;
                break;
            }

            if (match.Players.p2.Id == playerId)
            {
                playerIsMirrored = match.Players.p2.IsMirrored;
                matchId = match.MatchId;
                break;
            }

        }
        return new PlayerInfo(playerId, matchId, playerIsMirrored);
    }
}
