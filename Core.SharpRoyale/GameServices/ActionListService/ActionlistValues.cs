namespace Core.SharpRoyale.GameServices.ActionListService;

public abstract record ActionListValue;

// Note that values like EntityId(type) and id(for entity) are always send to client so you don't need it explicitly here
// For more info look at TickClientFeedback.cs
public record ActionListValueSpawn(Position Position, int EntityId, Player Player) : ActionListValue;

public record ActionListValueDespawn(int Id)
    : ActionListValue;

public record ActionListValueMove(Position Position, int EntityId, int Direction) : ActionListValue;
public record ActionListValueAttackMelee(int AttackerId, int VictimId) : ActionListValue;
public record ActionListValueAttackRanged(Entity Attacker, Entity Victim) : ActionListValue;

public record ActionListValueVictory(int PlayerId): ActionListValue;

public readonly record struct Position(double X, double Y);
