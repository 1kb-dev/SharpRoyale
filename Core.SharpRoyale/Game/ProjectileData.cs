namespace Core.SharpRoyale;

public static class ProjectileData
{
    public static readonly Dictionary<ProjectileType, (int Speed, int Damage)> Stats = new()
    {
        [ProjectileType.Arrow] = (Speed: 10, Damage: 5),
    };
}
