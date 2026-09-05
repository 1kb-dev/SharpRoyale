using Core.SharpRoyale;

namespace Core.SharpRoyale.GameServices.ActionListService;

public record ActionElement(ActionListOption Option, ActionListValue Values, DateTime Time);

public record ActionElementResult(
    Entity Entity,
    ActionListOption Option,
    ActionListValue Values,
    DateTime Time
);

public static class ActionListService
{
    public static void AppendActionListSpawn(ActionListValueSpawn values, Match match)
    {
        ArgumentNullException.ThrowIfNull(values);
        ArgumentNullException.ThrowIfNull(match);

        var normalizedPosition = NormalizeCenterForSize(values.Position, values.EntityId);
        var normalizedValues = values with { Position = normalizedPosition };

        match.ActionList.Add(
            new ActionElement(ActionListOption.Spawn, normalizedValues, DateTime.UtcNow)
        );
        SortActionList(match);
    }

    // System forced entity spawns ( think like the map)
    public static void AppendActionListSpawnSpecial(ActionListValueSpawn values, Match match)
    {
        ArgumentNullException.ThrowIfNull(values);
        ArgumentNullException.ThrowIfNull(match);

        var normalizedPosition = NormalizeCenterForSize(values.Position, values.EntityId);
        var normalizedValues = values with { Position = normalizedPosition };

        match.ActionList.Add(
            new ActionElement(ActionListOption.SpawnSpecial, normalizedValues, DateTime.UtcNow)
        );
        SortActionList(match);
    }

    public static void AppendActionListMove(ActionListValueMove values, Match match)
    {
        ArgumentNullException.ThrowIfNull(values);
        ArgumentNullException.ThrowIfNull(match);

        match.ActionList.Add(new ActionElement(ActionListOption.Move, values, DateTime.UtcNow));
        SortActionList(match);
    }

    private static Position NormalizeCenterForSize(Position position, int entityId)
    {
        (int width, int height) = Entities.EntityCatalog.GetSize(entityId);
        double x = SnapToParity(position.X, width);
        double y = SnapToParity(position.Y, height);
        return new Position(x, y);
    }

    private static double SnapToParity(double coordinate, int sizeDimension)
    {
        bool isOdd = sizeDimension % 2 != 0;
        double whole = Math.Floor(coordinate);
        return isOdd ? whole + 0.5 : whole;
    }

    public static void ApplyActionList(Match match)
    {
        ArgumentNullException.ThrowIfNull(match);

        match.ActionListResult.Clear();
        var actionList = GetResolvedActionList(match);

        foreach (var actionElement in actionList)
        {
            switch (actionElement.Option)
            {
                case ActionListOption.Spawn:
                    ApplySpawnAction(actionElement, match);
                    break;
                case ActionListOption.SpawnSpecial:
                    ApplySpawnActionSpecial(actionElement, match);
                    break;
                case ActionListOption.Move:
                    ApplyMoveAction(actionElement, match);
                    break;
                case ActionListOption.Attack:
                    ApplyAttackAction(actionElement);
                    break;
                case ActionListOption.Die:
                    ApplyDieAction(actionElement);
                    break;
                case ActionListOption.Exit:
                    ApplyExitAction(actionElement);
                    break;
            }
        }

        match.ActionList.Clear();
    }

    public static IReadOnlyList<ActionElement> GetResolvedActionList(Match match)
    {
        ArgumentNullException.ThrowIfNull(match);

        return match.ActionList.OrderBy(GetActionPhase).ToList();
    }

    private static void SortActionList(Match match)
    {
        // attack-style actions are processed before movement-style actions.
        var ordered = match.ActionList.OrderBy(GetActionPhase).ToList();

        match.ActionList.Clear();
        match.ActionList.AddRange(ordered);
    }

    private static int GetActionPhase(ActionElement actionElement)
    {
        return actionElement.Option switch
        {
            ActionListOption.Spawn => 0,
            ActionListOption.SpawnSpecial => 0,
            ActionListOption.Attack => 1,
            ActionListOption.Move => 2,
            ActionListOption.Die => 3,
            ActionListOption.Exit => 4,
            _ => 2,
        };
    }

    private static void ApplySpawnAction(ActionElement actionElement, Match match)
    {
        if (actionElement.Values is not ActionListValueSpawn val)
        {
            throw new InvalidOperationException();
        }
        Entity? success = SpawnService.SpawnService.SpawnSingularEntity(
            val.EntityId,
            val.player,
            match,
            val.Position
        );

        if (success is not null)
        {
            match.ActionListResult.Add(
                new ActionElementResult(
                    success,
                    actionElement.Option,
                    actionElement.Values,
                    actionElement.Time
                )
            );
        }
    }

    private static void ApplySpawnActionSpecial(ActionElement actionElement, Match match)
    {
        if (actionElement.Values is not ActionListValueSpawn val)
        {
            return;
        }

        Entity? success = SpawnService.SpawnService.SpawnSingularEntitySpecial(
            val.EntityId,
            val.player,
            match,
            val.Position
        );

        if (success is not null)
        {
            match.ActionListResult.Add(
                new ActionElementResult(
                    success,
                    actionElement.Option,
                    actionElement.Values,
                    actionElement.Time
                )
            );
        }
    }

    private static void ApplyMoveAction(ActionElement actionElement, Match match)
    {
        if (actionElement.Values is not ActionListValueMove move)
        {
            return;
        }

        Entity? entity = match.Map.Entities.FirstOrDefault(e => e.Id == move.EntityId);
        if (entity == null)
        {
            return;
        }

        NavigationService.NavigationService.MoveEntity(entity, move.Position);

        match.ActionListResult.Add(
            new ActionElementResult(
                entity,
                actionElement.Option,
                actionElement.Values,
                actionElement.Time
            )
        );
    }

    private static void ApplyAttackAction(ActionElement actionElement)
    {
        // TODO: apply attack logic.
    }

    private static void ApplyDieAction(ActionElement actionElement)
    {
        // TODO: apply die logic.
    }

    private static void ApplyExitAction(ActionElement actionElement)
    {
        // TODO: apply exit logic.
    }
}
