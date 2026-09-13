using Core.SharpRoyale.GameServices.ActionListService;
using Core.SharpRoyale.GameServices.UserInteractionService;

namespace Core.SharpRoyale.GameServices.SpawnService;

public static class SpawnService
{
    public static Entity? SpawnSingularEntity(
        int entityId,
        Player player,
        Match match,
        Position position
    )
    {
        /*
        if (!player.Deck.AvailableEntities.Contains(entityId))
            return null;
        if (!match.Map.CheckIfEntityCanBeDeployed(entityId, position, match))
            return null;
        if (!(player.Elixir >= -1)) //TODO
            return null;
        */

        Entity entity = DeckService.DeckService.GetEntityFromId(entityId, player.Id, match);
        entity.IsMirrored = player.IsMirrored;
        entity.Pos = position;
        match.Map.Entities.Add(entity);
        return entity;
    }

    public static Entity? SpawnSingularEntitySpecial(
        int entityId,
        Player player,
        Match match,
        Position position
    )
    {
        if (!match.Map.CheckIfEntityCanBeDeployed(entityId, position, match))
            return null;

        Entity entity = DeckService.DeckService.GetEntityFromId(entityId, player.Id, match); //TODO: Implement factory instead of this crap
        entity.IsMirrored = player.IsMirrored;
        entity.Pos = position;
        match.Map.Entities.Add(entity);
        return entity;
    }

    public static void DespawnSingularEntity(int Id, Match match)
    {
        Entity? entity = match.Map.Entities.FirstOrDefault(x => x.Id == Id);
        if (entity != null)
        {
            match.Map.Entities.Remove(entity);
        }
    }
}
