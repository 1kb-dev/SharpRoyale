namespace Core.SharpRoyale.GameServices.AttackService;

public static class AttackService
{
    public static void ApplyMeleeDamage(Entity attacker, Entity victim)
    {
        victim.ProcessDamage(attacker.Damage);
    }
}