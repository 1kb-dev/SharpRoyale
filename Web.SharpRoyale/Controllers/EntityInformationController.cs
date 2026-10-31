using Microsoft.AspNetCore.Mvc;

namespace Web.SharpRoyale.Controllers;

[Route("api/lobby")]
public class EntityInformationController: ControllerBase
{
    private static readonly IReadOnlyList<EntityInfoDto> EntityInformation = CreateEntityInformation();

    [HttpGet("entities")]
    public ActionResult<IReadOnlyList<EntityInfoDto>> GetEntities()
    {
        return Ok(EntityInformation);
    }

    private static IReadOnlyList<EntityInfoDto> CreateEntityInformation()
    {
        var entityTypes = typeof(Entity).Assembly
            .GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } && typeof(Entity).IsAssignableFrom(t));

        return entityTypes
            .Select(CreateEntityInfo)
            .OrderBy(entity => entity.EntityId)
            .ToArray();
    }

    private static EntityInfoDto CreateEntityInfo(Type entityType)
    {
        var entity = Activator.CreateInstance(entityType, new object?[] { null, null }) as Entity
            ?? throw new InvalidOperationException(
                $"Could not create metadata instance for entity type '{entityType.FullName}'.");

        return new EntityInfoDto(
            (int)entity.EntityId,
            entityType.Name,
            entity.Width,
            entity.Height,
            entity.HitboxRadius,
            entity.ElixirCost,
            entity.IsConstruction,
            entity.RestrictedDeployment,
            entity.Speed,
            entity.AttackDistance,
            entity.Damage);
    }
}

public sealed record EntityInfoDto(
    int EntityId,
    string Name,
    int Width,
    int Height,
    float HitboxRadius,
    int ElixirCost,
    bool IsConstruction,
    bool RestrictedDeployment,
    int Speed,
    float AttackDistance,
    int Damage
);
