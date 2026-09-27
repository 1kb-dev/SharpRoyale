using Core.SharpRoyale.GameServices.ActionListService;

namespace Core.SharpRoyale;

public class RangedAttack() : IAttackBehavior
{
    public required ProjectileType ProjectileType { get; init; }

    public void Attack(Match match, Entity self, Entity target)
    {
        ActionListService.AppendActionListAttackRanged(new ActionListValueAttackRanged(self, target), match);
    }
}
