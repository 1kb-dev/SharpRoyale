using Core.SharpRoyale.GameServices.ActionListService;

namespace Engine.SharpRoyale;

public record TickActionDto(
    ActionListOption Option,
    DateTime Time,
    int? EntityId = null,
    int? Id = null,
    int? OwnerId = null,
    bool? IsMirrored = null,
    object? Values = null
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
                actionElement.Time,
                EntityId: (int?)(actionElement.Entity?.EntityId),
                Id: actionElement.Entity?.Id,
                OwnerId: actionElement.Entity?.Owner,
                IsMirrored: actionElement.Entity?.IsMirrored,
                Values: actionElement.Values
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
