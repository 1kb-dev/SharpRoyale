namespace Core.SharpRoyale.GameServices.ActionListService;

public enum ActionListOption
{
    Spawn,
    SpawnSpecial,
    Move,
    Attack,
    Die,
    Exit,
}

public abstract record ActionListValue();

public readonly record struct Position(double X, double Y);

// Note that values like EntityId and id are always send to client so you don't need it explicitly here
// For more info look at TickClientFeedback.cs
public record ActionListValueSpawn(Position Position, int EntityId, Player player)
    : ActionListValue;

public record ActionListValueMove(Position Position, int EntityId) : ActionListValue;
