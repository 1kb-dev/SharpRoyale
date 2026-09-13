using Core.SharpRoyale.GameServices.ActionListService;

namespace Core.SharpRoyale;

public class MeleeAttack : IAttackBehavior
{
    public void Attack(Match match, Entity self, Entity target)
    {
        Console.WriteLine("reporting attack...");
        ActionListService.AppendActionListAttack(new ActionListValueAttack(self.Id, target.Id), match);
    }
}
