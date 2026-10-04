using System.Collections.Concurrent;
using System.Diagnostics;
using Core.SharpRoyale;
using Core.SharpRoyale.GameServices.ActionListService;
using Core.SharpRoyale.GameServices.DeckService;
using Core.SharpRoyale.GameServices.SpawnService;
using Core.SharpRoyale.GameServices.UserInteractionService;

namespace Engine.SharpRoyale;

public class GameEngine(TickClientFeedback tickClientFeedback)
{
    public readonly List<UserInteractionElement> UserInteractionList = [];

    public void AppendUserInteractionList(UserInteractionElement userInteraction)
    {
        UserInteractionList.Add(userInteraction);
    }

    public void DeployPlayerDecks(Player player1, Player player2, Match match)
    {
        DeckService.DeployPlayerDeck(player1, match);
        DeckService.DeployPlayerDeck(player2, match);
        // TODO: Probably need feedback to user here
    }

    public async Task RunGameLoop(Match m)
    {
        const int tickRate = 60;
        const int msPerTick = 1000 / tickRate;
        long tickId = 0;

        DeployPlayerDecks(m.Players.p1, m.Players.p2, m);

        await Task.Delay(5000);
        DebugHelper.StartTime(20);
        while (true)
        {
            //if (DebugHelper.IsOverLimit()) break;
            var sw = Stopwatch.StartNew();

            // Append User Actions to ActionListService
            foreach (UserInteractionElement userInteraction in UserInteractionList)
            {
                UserInteractionService.AppendUserInteraction(userInteraction);
            }

            UserInteractionList.Clear();

            for (int i = m.Map.Projectiles.Count - 1; i >= 0; i--)
            {
                var proj = m.Map.Projectiles[i];
                if (proj.CheckIsDone())
                {
                    proj.ApplyEffect();
                    m.Map.Projectiles.RemoveAt(i);
                }
            }

            // Collect Action
            foreach (Entity entity in m.Map.Entities)
            {
                entity.Tick();
            }

            // Apply Action
            ActionListService.ApplyActionList(m);

            // Feedback to clients
            var tickResult = tickClientFeedback.BuildTickResult(
                m.MatchId,
                tickId,
                m.ActionListResult
            );
            await tickClientFeedback.PublishTickResultAsync(tickResult);
            tickId++;

            // Sleep
            var elapsed = sw.ElapsedMilliseconds;
            if (elapsed < msPerTick)
                await Task.Delay((int)(msPerTick - elapsed));
        }
        Console.WriteLine($"Total Ticks: {tickId}");
    }
}
