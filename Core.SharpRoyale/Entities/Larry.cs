using System;
using Core.SharpRoyale.GameServices.ActionListService;
using Core.SharpRoyale.GameServices.NavigationService;

namespace Core.SharpRoyale.Entities;

public class Larry(int owner, Match match) : Entity(owner, match)
{
    public override int EntityId { get; } = 3;
    public override int Width { get; } = 1;
    public override int Height { get; } = 1;
    public override int ElixirCost { get; } = 1;
    public override bool RestrictedDeployment { get; } = true;
    public override int Speed { get; } = 1;
    public override bool IsConstruction { get; } = false;
    public override float HitboxRadius { get; } = 0.5f;
    public override float AttackDistance { get; } = 0.1f;
    protected override IAttackBehavior AttackBehavior { get; init; } = new MeleeAttack();
    protected override double AttackSpeed { get; } = 2;
    public override int Damage { get; } = 1;
    protected override int Health { get; set; } = 10;


    public override Entity ProcessDeployment(ushort x, ushort y)
    {
        Pos = new Position(x, y);
        return this;
    }

    public override void ProcessDebuff()
    {
        throw new NotImplementedException();
    }
}
