import {
  GameState,
  arthurDialog,
  arthurDialogFirstHasPotions,
  arthurDialogGirl,
  arthurDialogHasPotions,
  arthurDialogMother,
  dadAct1Dialog,
  georgesNpcDialog,
  georgesNpcDialog2,
  georgesNpcDialog3,
} from "../../data/dialogs.js";

import { Dialog } from "../../components/Dialog.js";
import { InteractionManager } from "../../core/InteractionManager.js";
import { Inventory } from "../../core/Inventory.js";
import { showItemPickup } from "../../core/ItemPickupEffect.js";

export function getNearNpcInteractable(scene) {
  if (scene.georges) {
    const nearGeorges = InteractionManager.getNearObject(
      scene.player,
      [scene.georges],
      25,
    );
    if (nearGeorges) return { type: "npc", target: nearGeorges };
  }

  if (scene.arthur) {
    const nearGeorgesGate = InteractionManager.getNearObject(
      scene.player,
      [scene.arthur],
      25,
    );
    if (nearGeorgesGate) return { type: "npc", target: nearGeorgesGate };
  }

  if (scene.dad) {
    const nearDad = InteractionManager.getNearObject(
      scene.player,
      [scene.dad],
      25,
    );
    if (nearDad) return { type: "npc", target: nearDad };
  }

  return null;
}

export function handleNpcTalk(scene, npc) {
  if (!npc) return;

  if (npc === scene.dad && scene.dadEmote) {
    scene.dadEmote.destroy();
    scene.dadEmote = null;
  }

  npc.setFlipX(scene.player.x < npc.x);

  if (npc === scene.georges) {
    const dialogToOpen = GameState.georgesTalked
      ? getNextGeorgesRepeatDialog()
      : georgesNpcDialog;
    Dialog.open(scene, dialogToOpen);
    if (!GameState.georgesTalked && !GameState.georgesPotionReceived) {
      scene.pendingGeorgesPotionReward = true;
    }
    GameState.georgesTalked = true;
    return;
  }

  if (npc === scene.arthur) {
    let dialogToOpen;
    if (!GameState.arthurFirstTalkDone) {
      GameState.arthurFirstTalkDone = true;
      if (GameState.totalPotionsReceived >= 3 && !GameState.arthurMoved) {
        dialogToOpen = arthurDialogFirstHasPotions;
        GameState.arthurMoved = true;
        scene.tweens.add({
          targets: scene.arthur,
          y: scene.arthur.y - 16,
          duration: 500,
          ease: "Linear",
        });
        scene.tweens.add({
          targets: scene.arthur.hitbox,
          y: scene.arthur.hitbox.y - 16,
          duration: 500,
          ease: "Linear",
        });
      } else {
        dialogToOpen = arthurDialog;
      }
    } else if (!GameState.arthurMoved) {
      if (GameState.totalPotionsReceived >= 3) {
        dialogToOpen = arthurDialogHasPotions;
        GameState.arthurMoved = true;
        scene.tweens.add({
          targets: scene.arthur,
          y: scene.arthur.y - 16,
          duration: 500,
          ease: "Linear",
        });
        scene.tweens.add({
          targets: scene.arthur.hitbox,
          y: scene.arthur.hitbox.y - 16,
          duration: 500,
          ease: "Linear",
        });
      } else {
        dialogToOpen = arthurDialog;
      }
    } else if (GameState.arthurTalkedAboutGirl) {
      dialogToOpen = arthurDialogMother;
      GameState.arthurTalkedAboutGirl = false;
    } else {
      dialogToOpen = arthurDialogGirl;
      GameState.arthurTalkedAboutGirl = true;
    }
    Dialog.open(scene, dialogToOpen);
    return;
  }

  if (npc === scene.dad) {
    Dialog.open(scene, dadAct1Dialog);
  }
}

export function tryGrantGeorgesPotionReward(scene) {
  if (!scene.pendingGeorgesPotionReward) return;
  if (Dialog.isOpen()) return;

  scene.pendingGeorgesPotionReward = false;
  if (GameState.georgesPotionReceived || !scene.georges) return;

  Inventory.add({
    id: "potion",
    name: "Potion",
    texture: "potion",
    type: "consumable",
  });
  showItemPickup(scene, scene.georges, "potion", 0);
  GameState.georgesPotionReceived = true;
  GameState.totalPotionsReceived += 1;
}

function getNextGeorgesRepeatDialog() {
  const nextDialog = GameState.georgesUseDialog3Next
    ? georgesNpcDialog3
    : georgesNpcDialog2;
  GameState.georgesUseDialog3Next = !GameState.georgesUseDialog3Next;
  return nextDialog;
}
