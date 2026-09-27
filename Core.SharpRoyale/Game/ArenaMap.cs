using Core.SharpRoyale.GameServices.ActionListService;

namespace Core.SharpRoyale;

public class ArenaMap
{
    private const int _width = 18;
    private const int _height = 32;

    private readonly Tile[,] _tiles;
    public List<Entity> Entities { get; } = new();
    public List<Projectile> Projectiles { get; } = new();

    public ArenaMap()
    {
        _tiles = new Tile[_width, _height];

        // default
        for (var x = 0; x < _width; x++)
        for (var y = 0; y < _height; y++)
        {
            _tiles[x, y] = new Tile();
            _tiles[x, y].Kind = TileKind.Standard;
        }

        // River
        for (var x = 0; x < _width; x++)
            _tiles[x, 15].Kind = TileKind.River;

        // Bridges
        _tiles[5, 15].Kind = TileKind.Bridge;
        _tiles[12, 15].Kind = TileKind.Bridge;
    }


    private void Debug((Player p1, Player p2) players, Match match)
    {
        // P2 - top side
        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(12, 1), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(8, 20), (int)EntityId.Larry, players.p2),
            match
        );
        return;

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(6, 2), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(15, 4), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(3, 5), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(10, 8), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(1, 9), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(14, 10), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(7, 11), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(16, 13), (int)EntityId.Larry, players.p2),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(4, 14), (int)EntityId.Larry, players.p2),
            match
        );

        // P1 - bottom side
        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(10, 18), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(2, 19), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(15, 20), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(6, 21), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(12, 23), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(1, 24), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(16, 26), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(8, 27), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(14, 29), (int)EntityId.Larry, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(4, 31), (int)EntityId.Larry, players.p1),
            match
        );
    }

    public ArenaMap AddPlayerTowers((Player p1, Player p2) players, Match match)
    {
        //Debug(players, match);

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(9, 30), (int)EntityId.King, players.p1),
            match
        );
        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(3, 28), (int)EntityId.Tower, players.p1),
            match
        );
        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(14, 28), (int)EntityId.Tower, players.p1),
            match
        );

        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(9, 2), (int)EntityId.King, players.p2),
            match
        );
        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(3, 4), (int)EntityId.Tower, players.p2),
            match
        );
        ActionListService.AppendActionListSpawnSpecial(
            new ActionListValueSpawn(new Position(14, 4), (int)EntityId.Tower, players.p2),
            match
        );

        return this;
    }

    public bool CheckIfEntityCanBeDeployed(int entityId, Position pos, Match match)
    {
        //TODO: Another Days Work
        return true;
    }
}
