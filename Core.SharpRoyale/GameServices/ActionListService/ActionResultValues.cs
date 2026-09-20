namespace Core.SharpRoyale.GameServices.ActionListService;

public abstract record ActionResultValue();

// Note that values like EntityId(type) and id(for entity) are always send to client so you don't need it explicitly here
// For more info look at TickClientFeedback.cs
public record ActionResultValueSpawn(Position Position, Player player)
    : ActionResultValue;

public record ActionResultValueDespawn(int Id)
    : ActionResultValue;

public record ActionResultValueMove(Position Position) : ActionResultValue;
public record ActionResultValueAttack(int AttackerId, int VictimId) : ActionResultValue;