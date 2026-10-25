using Core.SharpRoyale.GameServices.ActionListService;
using Core.SharpRoyale.GameServices.AttackService;
using Core.SharpRoyale.GameServices.NavigationService;

namespace Core.SharpRoyale;

public abstract class Entity(int owner, Match match)
{
    // Identity & ownership
    public int Id { get; } = match.GetNextEntityId();
    public abstract EntityId EntityId { get; }
    public int Owner { get; } = owner;
    public bool IsMirrored { get; set; }

    // Physical/stat properties (abstract, set by derived types)
    public abstract int Width { get; }
    public abstract int Height { get; }
    public abstract float HitboxRadius { get; } // 0 for none, none for construction types, as they are square hitboxes
    public abstract int ElixirCost { get; }
    public abstract bool IsConstruction { get; }
    public abstract bool RestrictedDeployment { get; }
    protected abstract int Health { get; set; }

    // Movement
    public Position Pos { get; set; }
    public abstract int Speed { get; }
    public double MoveAccumulator { get; set; }
    public double TickRate = 1.0 / 60;

    // Combat
    internal abstract IAttackBehavior AttackBehavior { get; init; }
    public abstract float AttackDistance { get; }
    protected abstract double AttackSpeed { get; } // seconds between attacks
    public abstract int Damage { get; }
    protected double AttackAccumulator { get; set; }
    public Entity? Aggro { get; set; } // When entity starts attacking and fully lcoked
    public virtual int AggroRange { get; } = 6; // the area where the entity will start following an entity, not locked.
    public bool IsDead { get; set; }

    public abstract Entity ProcessDeployment(ushort x, ushort y);

    public void ProcessDamage(int damage)
    {
        this.Health =  Math.Max(0, this.Health - damage);
        if (this.Health == 0)
        {
            IsDead = true;
        }
        Console.WriteLine($"Got hit. Current HP: {this.Health}");
    }

    public abstract void ProcessDebuff();

    public void Tick()
    {
        if (IsDead)
        {
            ActionListService.AppendActionListDespawn(new ActionListValueDespawn(Id), match);
            if (EntityId == EntityId.King)
            {
                int winnerId = match.Players.p1.Id == this.Owner? match.Players.p2.Id : match.Players.p1.Id;
                ActionListService.AppendActionListVictory(new ActionListValueVictory(winnerId),  match);
                match.WinnerPlayerId = winnerId;
            }
            return;
        }
        if (CheckIfAggroWithinRange(Aggro))
        {
            AttackAccumulator += TickRate;

            if (AttackAccumulator >= AttackSpeed)
            {
                AttackAccumulator -= AttackSpeed;
                AttackBehavior.Attack(match, this, Aggro!);
                Console.WriteLine("Attacked");
            }

            return;
        }

        Aggro = null;
        AttackAccumulator = 0;

        if (!IsConstruction)
        {
            (Position nextPos, Entity? closestEntity) = NavigationService.GetNextNavigation(this, match, TickRate);
            if (closestEntity is not null) AttackService.AssignAggroIfInRange(this, closestEntity);
            int direction = NavigationService.GetDirection(this.Pos, nextPos);
            ActionListService.AppendActionListMove(new ActionListValueMove(nextPos, this.Id, direction), match);
        }
        else
        {
            AttackService.TryAssignAggro(this, match);
        }
    }

    private bool CheckIfAggroWithinRange(Entity? aggro)
    {
        if (aggro is null) return false;
        if (aggro.IsDead) return false;

        double distance;
        if (aggro.IsConstruction)
        {
            distance = NavigationService.GetDistanceToConstruction(this, aggro);
            distance -= 0.5;
        }
        else
        {
            distance = NavigationService.GetDistanceToHitbox(this, aggro);
        }

        if (distance <= AttackDistance) return true;
        return false;
    }
}

public enum EntityId
{
    Tower = 1,
    King = 2,
    Larry = 3,
}
