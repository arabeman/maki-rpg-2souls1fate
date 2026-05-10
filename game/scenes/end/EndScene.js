import { Scene, manager } from "@tialops/maki";

class EndScene extends Scene {
 constructor() {
   super({ key: "EndScene" });
  
   // Set window reference for dialog callbacks
   window.currentEndScene = this;
 }

 preload() {
   super.preload();
 }

 create() {
   super.create();
   manager.create(this);

   // Hide all HUD components except restart HUD
   this.hideHUDComponents();

   // Fade in
   this.cameras.main.fadeIn(500);
 }

 hideHUDComponents() {
   // Hide health HUD
   const healthHUD = document.querySelector('.health-hud');
   if (healthHUD) {
     healthHUD.style.display = 'none';
   }

   // Hide equipment HUD
   const equipmentHUD = document.querySelector('.equipment-hud');
   if (equipmentHUD) {
     equipmentHUD.style.display = 'none';
   }

   // Hide potion HUD
   const potionHUD = document.querySelector('.potion-hud');
   if (potionHUD) {
     potionHUD.style.display = 'none';
   }

   // Keep restart HUD visible (no action needed as it should remain visible)
 }

 update() {
 }
}

export { EndScene };

