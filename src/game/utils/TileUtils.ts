export class TileUtils {
  static getReachableTiles(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    movement: number,
    groundLayer: Phaser.Tilemaps.TilemapLayer
  ): Phaser.Tilemaps.Tile[] {
    // Convert world coordinates to tile coordinates
    const tileWidth = groundLayer.tilemap.tileWidth;
    const tileHeight = groundLayer.tilemap.tileHeight;
    const startTileX = Math.floor(startX / tileWidth);
    const startTileY = Math.floor(startY / tileHeight);
    
    console.log('TileUtils starting position:', {
      worldX: startX,
      worldY: startY,
      tileX: startTileX,
      tileY: startTileY,
      tileWidth,
      tileHeight
    });
    
    const startTile = groundLayer.getTileAt(startTileX, startTileY);
    if (!startTile) {
      console.log('No start tile found at position:', { startTileX, startTileY });
      return [];
    }
    
    const reachable: Phaser.Tilemaps.Tile[] = [];
    const visited = new Set<string>();
    
    // Queue for BFS: [tile, distance]
    const queue: [Phaser.Tilemaps.Tile, number][] = [[startTile, 0]];
    visited.add(`${startTileX},${startTileY}`);
    reachable.push(startTile);
    
    while (queue.length > 0) {
      const [currentTile, currentDistance] = queue.shift()!;
      
      // Check adjacent tiles
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dx, dy] of directions) {
        const newX = currentTile.x + dx;
        const newY = currentTile.y + dy;
        
        // Skip if out of bounds
        if (newX < 0 || newX >= groundLayer.tilemap.width || 
            newY < 0 || newY >= groundLayer.tilemap.height) {
          continue;
        }
        
        const key = `${newX},${newY}`;
        if (visited.has(key)) continue;
        
        const nextTile = groundLayer.getTileAt(newX, newY);
        if (!nextTile || nextTile.properties?.State === 3) continue;
        
        // Calculate Manhattan distance from start
        const distance = Math.abs(newX - startTileX) + Math.abs(newY - startTileY);
        
        // Only add if within movement range
        if (distance <= movement) {
          visited.add(key);
          reachable.push(nextTile);
          
          // Only continue BFS if we haven't reached max movement range
          if (distance < movement) {
            queue.push([nextTile, distance]);
          }
        }
      }
    }
    
    console.log('Reachable tiles calculated:', {
      startTile: { x: startTileX, y: startTileY },
      reachableTiles: reachable.map(t => ({ x: t.x, y: t.y })),
      count: reachable.length
    });
    
    return reachable;
  }
} 