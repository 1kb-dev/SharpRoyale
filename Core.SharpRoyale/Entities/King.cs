using System;
using Core.SharpRoyale.GameServices.ActionListService;
using Core.SharpRoyale.GameServices.NavigationService;

namespace Core.SharpRoyale.Entities;

public class King(int owner, Match match) : Entity(owner, match)
{
    public override int EntityId { get; } = 2;
    public override int Width { get; } = 4;
    public override int Height { get; } = 4;
    public override int ElixirCost { get; } = 0;
    public override bool RestrictedDeployment { get; } = true;
    public override int Speed { get; } = 0;
    public override bool IsConstruction { get; } = true;
    public override float HitboxRadius { get; } = 0f;
    public override float AttackDistance { get; } = 10f;
    protected override IAttackBehavior AttackBehavior { get; init; } = new RangedAttack();
    protected override double AttackSpeed { get; } = 2;
    public override int Damage { get; } = 10;
    protected override int Health { get; set; } = 100;

    public override Entity ProcessDeployment(ushort x, ushort y)
    {
        Pos = new Position(x, y);
        return this;
    }

    public override void ProcessDebuff()
    {
        throw new NotImplementedException();
    }

    private void ApplyAction(ActionListOption option, object values)
    {
        //ActionListService.AppendActionList(option, values, this, match );
    }
}
