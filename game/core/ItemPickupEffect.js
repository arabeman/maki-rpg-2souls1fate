export function showItemPickup(scene, target, itemSprite) {
  const sprite = scene.add.sprite(target.x, target.y - 20, itemSprite);
  sprite.setOrigin(0.5);
  sprite.setDepth(200);
  sprite.setRotation(-Math.PI / 2);

  scene.tweens.add({
    targets: sprite,
    y: target.y - 40,
    alpha: 0,
    duration: 2000,
    ease: "Sine.easeOut",
    onComplete: () => sprite.destroy(),
  });

  return sprite;
}