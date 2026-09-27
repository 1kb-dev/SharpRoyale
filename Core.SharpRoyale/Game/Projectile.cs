using Core.SharpRoyale.GameServices.ActionListService;

namespace Core.SharpRoyale;

public class Projectile(ProjectileType projectileType ,int id, Entity attacker, Entity victim)
{
    public ProjectileType ProjectileType = projectileType;
    public int Id { get; } = id;
    public Entity Attacker { get; } =  attacker;
    public Entity Victim { get; } =  victim;
    public Position Position { get; set; } = attacker.Pos;
    public int Direction { get; } = GetDirection(attacker, victim);
    public int Speed { get; } = GetSpeed(projectileType);

    public void MoveOneTick(double deltaTime, Match match)
    {
        double dx = Victim.Pos.X - Attacker.Pos.X;
        double dy = Victim.Pos.Y - Attacker.Pos.Y;

        double distance = Math.Sqrt(dx * dx + dy * dy);

        double stepSize = Attacker.Speed * deltaTime;

        if (distance <= stepSize || distance == 0)
        {
            Position = Victim.Pos;
        }

        double stepX = dx / distance;
        double stepY = dy / distance;

        Position = new Position(Attacker.Pos.X + stepX * stepSize, Attacker.Pos.Y + stepY * stepSize);
        ActionListService.AppendActionListMove(new ActionListValueMove(Position, this.Id), match);
    }

    private static int GetDirection(Entity attacker, Entity victim)
    {
        // Clockwise: 12 = 0, 6 = 180 etc (or so I believe, I didn't do the math cus I ain't no nerd)
        double dx = victim.Pos.X - attacker.Pos.X;
        double dy = victim.Pos.Y - attacker.Pos.Y;

        double radians = Math.Atan2(dx, -dy);
        double degrees = radians * (180.0 / Math.PI);

        if (degrees < 0)
            degrees += 360;

        return (int)Math.Round(degrees);
    }

    private static int GetSpeed(ProjectileType projectileType)
    {
        var stats = ProjectileData.Stats[projectileType];
        return stats.Speed;
    }
}