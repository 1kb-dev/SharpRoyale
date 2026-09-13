using Core.SharpRoyale.GameServices.ActionListService;

namespace Core.SharpRoyale;

public interface IAttackBehavior
{
    void Attack(Match match, Entity self, Entity target);
}
