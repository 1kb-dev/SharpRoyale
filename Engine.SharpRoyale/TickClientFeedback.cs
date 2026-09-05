using Core.SharpRoyale.GameServices.ActionListService;

namespace Engine.SharpRoyale;

public record TickActionDto(
    ActionListOption Option,
    int EntityId,
    int Id,
    int OwnerId,
    bool isMirrored,
    object? Values,
    DateTime Time
);

public record TickResultDto(int MatchId, long TickId, IReadOnlyList<TickActionDto> Actions);

public class TickClientFeedback(ITickResultPublisher tickResultPublisher)
{
    public TickResultDto BuildTickResult(
        int matchId,
        long tickId,
        IReadOnlyList<ActionElementResult> resolvedActions
    )
    {
        ArgumentNullException.ThrowIfNull(resolvedActions);

        var actions = resolvedActions
            .Select(actionElement => new TickActionDto(
                actionElement.Option,
                actionElement.Entity.EntityId,
                actionElement.Entity.Id,
                actionElement.Entity.Owner,
                actionElement.Entity.IsMirrored,
                actionElement.Values,
                actionElement.Time
            ))
            .ToList();

        return new TickResultDto(matchId, tickId, actions);
    }

    public Task PublishTickResultAsync(
        TickResultDto tickResult,
        CancellationToken cancellationToken = default
    )
    {
        ArgumentNullException.ThrowIfNull(tickResult);
        return tickResultPublisher.PublishTickResultAsync(tickResult, cancellationToken);
    }
}
