using System.Collections.Concurrent;
using System.Text.Json;

namespace Web.SharpRoyale.Infrastructure;

public class MatchNotifier
{
    private readonly ConcurrentDictionary<int, HttpResponse> _clients = new();
    private readonly ConcurrentDictionary<int, TaskCompletionSource<bool>> _waiters = new();
    public void Register(int playerId, HttpResponse response)
    {
        _clients[playerId] = response;
    }

    public void Unregister(int playerId)
    {
        _clients.TryRemove(playerId, out _);
    }

    public async Task NotifyMatch(Player p1, Player p2, int matchId)
    {
        if (_clients.TryGetValue(p1.Id, out var r1))
        {
            var payload = new { type = "matchFound", matchId = matchId };
            await WriteSse(r1, JsonSerializer.Serialize(payload));
        }

        if (_clients.TryGetValue(p2.Id, out var r2))
        {
            var payload = new { type = "matchFound", matchId = matchId };
            await WriteSse(r2, JsonSerializer.Serialize(payload));
        }
    }

    private async Task WriteSse(HttpResponse res, string msg)
    {
        await res.WriteAsync($"data: {msg}\n\n");
        await res.Body.FlushAsync();
    }

    public async Task WaitForMatchAsync(int playerId, CancellationToken ct)
    {
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        _waiters[playerId] = tcs;

        try
        {
            // Kept alive for the whole wait and disposed on completion/cancellation
            // instead of leaking one registration per heartbeat.
            using var registration = ct.Register(
                static state => ((TaskCompletionSource<bool>)state!).TrySetCanceled(),
                tcs
            );

            await tcs.Task;
        }
        finally
        {
            // Only remove our own waiter, so a late cleanup cannot drop a newer one.
            if (_waiters.TryGetValue(playerId, out var waiter) && ReferenceEquals(waiter, tcs))
            {
                _waiters.TryRemove(playerId, out _);
            }
        }
    }

    public void SignalMatchFound(Player p1, Player p2)
    {
        if (_waiters.TryRemove(p1.Id, out var tcs1))
        {
            tcs1.TrySetResult(true);
        }

        if (_waiters.TryRemove(p2.Id, out var tcs2))
        {
            tcs2.TrySetResult(true);
        }
    }
}
