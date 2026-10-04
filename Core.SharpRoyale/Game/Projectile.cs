using Core.SharpRoyale.GameServices.ActionListService;
using Core.SharpRoyale.GameServices.NavigationService;

namespace Core.SharpRoyale;

public class Projectile(ProjectileType projectileType ,int id, Entity attacker, Entity victim)
{
    public ProjectileType ProjectileType = projectileType;
    public int Id { get; } = id;
    public Entity Attacker { get; } =  attacker;
    public Entity Victim { get; } =  victim;
    public Position Position { get; set; } = attacker.Pos;
    public int Direction { get; } = NavigationService.GetDirection(attacker.Pos, victim.Pos);
    public int Speed { get; } = GetSpeed(projectileType);
    public long LifeStamp { get; } = Environment.TickCount64;

    // Total flight time in ms
    public long LifeSpan { get; } = GetLifeSpan(attacker, victim, GetSpeed(projectileType));

    public void ApplyEffect()
    {
        Victim.ProcessDamage(Attacker.Damage);
    }

    private static long GetLifeSpan(Entity attacker, Entity victim, int speed)
    {
        if (speed <= 0) return 0;

        double dx = victim.Pos.X - attacker.Pos.X;
        double dy = victim.Pos.Y - attacker.Pos.Y;
        double distance = Math.Sqrt(dx * dx + dy * dy);

        return (long)(distance / speed * 1000);
    }

    public bool CheckIsDone()
    {
        return Environment.TickCount64 - LifeStamp >= LifeSpan;
    }

    private static int GetSpeed(ProjectileType projectileType)
    {
        var stats = ProjectileData.Stats[projectileType];
        return stats.Speed;
    }
}