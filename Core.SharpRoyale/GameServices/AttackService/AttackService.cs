using Core.SharpRoyale.GameServices.NavigationService;
namespace Core.SharpRoyale.GameServices.AttackService;

public static class AttackService
{
    public static void ApplyMeleeDamage(Entity attacker, Entity victim)
    {
        victim.ProcessDamage(attacker.Damage);
    }

    public static Projectile CreateProjectile(ProjectileType projectileType, Entity attacker, Entity victim, Match match)
    {
        Projectile proj = new Projectile(projectileType, match.GetNextEntityId(), attacker, victim);
        match.Map.Projectiles.Add(proj);

        return proj;
    }
    
    public static void AssignAggroIfInRange(Entity entity, Entity navTargetEntity)
    {
        double distance = 0;
        if (navTargetEntity.IsConstruction)
        {
            distance = NavigationService.NavigationService.GetDistanceToConstruction(entity, navTargetEntity);
        }
        else
        {
            distance = NavigationService.NavigationService.GetDistanceToHitbox(entity, navTargetEntity);
        }
        if (distance <= entity.AggroRange)
            entity.Aggro = navTargetEntity;
    }

    public static void TryAssignAggro(Entity entity, Match match)
    {
        Entity? closestEntity = NavigationService.NavigationService.GetClosestEntity(entity, match);
        if (closestEntity != null) AssignAggroIfInRange(entity, closestEntity);
    }
}