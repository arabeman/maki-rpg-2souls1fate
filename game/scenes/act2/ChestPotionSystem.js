import { GameState } from "../../data/dialogs.js";
import { InteractionManager } from "../../core/InteractionManager.js";
import { Inventory } from "../../core/Inventory.js";
import { manager } from "@tialops/maki";
import { showItemPickup } from "../../core/ItemPickupEffect.js";
import { WEAPONS } from "../../data/weapons.js";

export function createPotionChests(scene) {
  scene.chests = [
    {
      stateKey: "act2ChestPotionTaken",
      requiresAmeliaTalk: true,
      sprite: scene.physics.add.sprite(
        74,
        62,
        GameState.act2ChestPotionTaken ? "chest_opened" : "chest_closed",
      ),
    },
    {
      stateKey: "act2ChestPotionTaken2",
      requiresAmeliaTalk: true,
      sprite: scene.physics.add.sprite(
        92,
        59,
        GameState.act2ChestPotionTaken2 ? "chest_opened" : "chest_closed",
      ),
    },
    {
      stateKey: "act2ChestPotionTaken3",
      requiresAmeliaTalk: true,
      sprite: scene.physics.add.sprite(
        110,
        59,
        GameState.act2ChestPotionTaken3 ? "chest_opened" : "chest_closed",
      ),
    },
    {
      stateKey: "act2ChestPotionTaken4",
      requiresAmeliaTalk: true,
      sprite: scene.physics.add.sprite(
        128,
        62,
        GameState.act2ChestPotionTaken4 ? "chest_opened" : "chest_closed",
      ),
    },
    {
      stateKey: "act2ChestPotionTaken5",
      reward: {
        ...WEAPONS.sword2,
        type: "weapon",
        slot: "mainHand",
      },
      sprite: scene.physics.add.sprite(
        354,
        53,
        GameState.act2ChestPotionTaken5 ? "chest_opened" : "chest_closed",
      ),
    },
    {
      stateKey: "act2ChestPotionTaken6",
      sprite: scene.physics.add.sprite(
        648,
        522,
        GameState.act2ChestPotionTaken6 ? "chest_opened" : "chest_closed",
      ),
    },
  ];

  for (const chestEntry of scene.chests) {
    const chest = chestEntry.sprite;
    chest.potionStateKey = chestEntry.stateKey;
    chest.requiresAmeliaTalk = Boolean(chestEntry.requiresAmeliaTalk);
    chest.reward =
      chestEntry.reward || {
        id: "potion",
        name: "Potion",
        texture: "potion",
        type: "consumable",
      };
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
  if (chest?.requiresAmeliaTalk && !GameState.ameliaSisterTalked) return;
  if (!chest || !chest.potionStateKey || GameState[chest.potionStateKey]) return;

  chest.setTexture("chest_opened");
  const reward = chest.reward || {
    id: "potion",
    name: "Potion",
    texture: "potion",
    type: "consumable",
  };
  Inventory.add(reward);
  showItemPickup(scene, chest, reward.texture, 0);
  GameState[chest.potionStateKey] = true;
  if (reward.id === "potion") {
    GameState.totalPotionsReceived += 1;
  } else if (reward.slot === "mainHand") {
    GameState.hasWeapon = true;
  }
}