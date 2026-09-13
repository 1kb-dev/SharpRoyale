using Core.SharpRoyale.GameServices.ActionListService;
using Core.SharpRoyale.GameServices.NavigationService;

namespace Core.SharpRoyale;

public abstract class Entity(int Owner, Match match)
{
    // Identity & ownership
    public int Id { get; } = match.GetNextEntityId();
    public abstract int EntityId { get; }
    public int Owner { get; } = Owner;
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
    public abstract float AttackDistance { get; }
    protected abstract double AttackSpeed { get; } // seconds between attacks
    public abstract int Damage { get; }
    protected double AttackAccumulator { get; set; }
    public Entity? Aggro { get; set; } = null;
    public int AggroRange { get; } = 6;
    public bool isDead { get; set; } = false;

    public abstract Entity ProcessDeployment(ushort x, ushort y);

    public void ProcessDamage(int damage)
    {
        this.Health =  Math.Max(0, this.Health - damage);
        if (this.Health == 0)
        {
            isDead = true;
        }
        Console.WriteLine($"Got hit. Current HP: {this.Health}");
    }

    public abstract void ProcessDebuff();
    protected abstract IAttackBehavior AttackBehavior { get; init; }

    public void Tick()
    {
        if (isDead)
        {
            ActionListService.AppendActionListDespawn(new ActionListValueDespawn(Id), match);
            return;
        }
        if (CheckIfAggroWithinRange(Aggro))
        {
            AttackAccumulator += TickRate;

            if (AttackAccumulator >= AttackSpeed)
            {
                AttackAccumulator -= AttackSpeed; // keep the overflow instead of zeroing it
                AttackBehavior.Attack(match, this, Aggro);
                Console.WriteLine("Attacked");
            }

            return;
        }
        
        Aggro = null;
        AttackAccumulator = 0;
        
        if (!IsConstruction)
        {
            Position nextPos = NavigationService.GetNextNavigation(this, match, TickRate);
            ActionListService.AppendActionListMove(new ActionListValueMove(nextPos, this.Id), match);
        }
    }

    private bool CheckIfAggroWithinRange(Entity? aggro)
    {
        if (aggro is null) return false;
        if (aggro.isDead) return false;

        double distance = 0;
        if (aggro.IsConstruction)
        {
            distance = NavigationService.GetDistanceToConstruction(this, aggro);
            distance -= 0.5; // Idk why. But I dont want to refactor navigation again...
        }
        else
        {
            distance = NavigationService.GetDistanceToHitbox(this, aggro);
        }
        
        Console.WriteLine($"distance: {distance}");
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
