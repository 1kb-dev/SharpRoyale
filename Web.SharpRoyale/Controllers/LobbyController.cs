using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Web.SharpRoyale.Controllers;

[Authorize]
[Route("api/lobby")]
public class LobbyController(LobbyService lobbyService, MatchNotifier matchNotifier) : ControllerBase
{
    [HttpGet("stream/join")]
    public async Task JoinQue()
    {
        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");

        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(idValue) || !int.TryParse(idValue, out var playerId))
        {
            Response.StatusCode = StatusCodes.Status401Unauthorized;
            return;
        }

        matchNotifier.Register(playerId, Response);
        lobbyService.JoinQueue(playerId);

        try
        {
            var ct = HttpContext.RequestAborted;

            var matchTask = matchNotifier.WaitForMatchAsync(playerId, ct);

            while (!ct.IsCancellationRequested)
            {
                try
                {
                    await matchTask.WaitAsync(TimeSpan.FromSeconds(15), ct);
                    break; // match found
                }
                catch (TimeoutException)
                {
                    // Keep the SSE connection alive through proxies/idle timeouts.
                    await Response.WriteAsync(": heartbeat\n\n", ct);
                    await Response.Body.FlushAsync(ct);
                }
            }
        }
        catch (OperationCanceledException)
        {
            // client disconnected
        }
        finally
        {
            matchNotifier.Unregister(playerId);
            lobbyService.RemoveFromQueue(playerId);
        }
    }

    [HttpGet("exit")]
    public IActionResult ExitQue()
    {
        return Ok();
    }
}
