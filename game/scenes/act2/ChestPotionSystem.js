import { GameState } from "../../data/dialogs.js";
import { Inventory } from "../../core/Inventory.js";
import { InteractionManager } from "../../core/InteractionManager.js";
import { manager } from "@tialops/maki";
import { showItemPickup } from "../../core/ItemPickupEffect.js";

export function createPotionChests(scene) {
  scene.chests = [
    {
      stateKey: "act2ChestPotionTaken",
      sprite: scene.physics.add.sprite(
        354,
        53,
        GameState.act2ChestPotionTaken ? "chest_opened" : "chest_closed",
      ),
    },
  ];

  for (const chestEntry of scene.chests) {
    const chest = chestEntry.sprite;
    chest.potionStateKey = chestEntry.stateKey;
    chest.body.setImmovable(true);
    chest.body.setCollideWorldBounds(true);
    scene.physics.add.collider(scene.player.hitbox, chest);
    scene.physics.add.collider(chest, manager.getWallGroup(scene, "act_2"));
  }
}

export function getNearChestInteractable(scene) {
  if (!scene.chests?.length) return null;
  const nearChest = InteractionManager.getNearObject(
    scene.player,
    scene.chests.map((entry) => entry.sprite),
    20,
  );
  return nearChest ? { type: "chest", target: nearChest } : null;
}

export function handleChestInteraction(scene, chest) {
  if (!chest || !chest.potionStateKey || GameState[chest.potionStateKey]) return;

  chest.setTexture("chest_opened");
  Inventory.add({
    id: "potion",
    name: "Potion",
    texture: "potion",
    type: "consumable",
  });
  showItemPickup(scene, chest, "potion", 0);
  GameState[chest.potionStateKey] = true;
  GameState.totalPotionsReceived += 1;
}