export class InteractionManager {
  static getNearObject(player, targets, distance) {
    for (const target of targets) {
      const dx = player.x - target.x;
      const dy = player.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < distance) {
        return target;
      }
    }
    return null;
  }

  static isNear(player, target, distance) {
    const dx = player.x - target.x;
    const dy = player.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < distance;
  }

  static getNearNPCs(player, npcs, distance = 25) {
    return npcs.filter(npc => this.isNear(player, npc, distance));
  }

  static getNearPickables(player, pickables, distance = 20) {
    return pickables.filter(obj => this.isNear(player, obj, distance));
  }
}