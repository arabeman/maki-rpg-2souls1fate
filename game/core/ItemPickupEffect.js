export function showItemPickup(scene, target, itemName) {
  const text = scene.add.text(target.x, target.y - 20, `+ ${itemName}`, {
    fontFamily: "Monocraft",
    fontSize: "12px",
    color: "#db9764",
    stroke: "#000000",
    strokeThickness: 2,
  });
  text.setOrigin(0.5);
  text.setDepth(200);

  scene.tweens.add({
    targets: text,
    y: target.y - 40,
    alpha: 0,
    duration: 1000,
    ease: "Sine.easeOut",
    onComplete: () => text.destroy(),
  });

  return text;
}