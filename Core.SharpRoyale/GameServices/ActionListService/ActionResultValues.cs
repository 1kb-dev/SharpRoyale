namespace Core.SharpRoyale.GameServices.ActionListService;

public abstract record ActionResultValue();

// Note that values like EntityId(type) and id(for entity) are always send to client so you don't need it explicitly here
// For more info look at TickClientFeedback.cs
public record ActionResultValueSpawn(Position Position, Player player)
    : ActionResultValue;

public record ActionResultValueDespawn(int Id)
    : ActionResultValue;

public record ActionResultValueMove(Position Position, int Direction) : ActionResultValue;
public record ActionResultValueAttackMelee(int AttackerId, int VictimId) : ActionResultValue;

public record ActionResultValueAttackRanged(
    int AttackerId,
    ProjectileType ProjectileType,
    int ProjectileId,
    Position StartPosition,
    Position EndPosition,
    int Direction,
    int Speed
) : ActionResultValue;
