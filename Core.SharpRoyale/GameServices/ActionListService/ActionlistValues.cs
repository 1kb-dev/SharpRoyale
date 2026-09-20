namespace Core.SharpRoyale.GameServices.ActionListService;

public abstract record ActionListValue();

// Note that values like EntityId(type) and id(for entity) are always send to client so you don't need it explicitly here
// For more info look at TickClientFeedback.cs
public record ActionListValueSpawn(Position Position, int EntityId, Player player)
    : ActionListValue;

public record ActionListValueDespawn(int Id)
    : ActionListValue;

public record ActionListValueMove(Position Position, int EntityId) : ActionListValue;
public record ActionListValueAttack(int AttackerId, int VictimId) : ActionListValue;

public readonly record struct Position(double X, double Y);
