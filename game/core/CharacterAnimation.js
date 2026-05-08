export const AnimationConfig = {
  depth: 100,
  baseWidth: 14,
  baseHeight: 14,
  idleWidth: 16,
  idleHeight: 14,
  walkWidth: 14,
  walkHeight: 15,
  pulseAmplitude: { width: 0.6, height: 0.7 },
  pulsePeriod: { width: 110, height: 80 },
  defaultSpeed: 160,
  stopDistance: 4,
  playerAnimPrefix: "player-",
  npcAnimPrefix: "npc-",
};

export const PlayerConfig = {
  ...AnimationConfig,
  animPrefix: AnimationConfig.playerAnimPrefix,
};
export const NPCConfig = {
  ...AnimationConfig,
  animPrefix: AnimationConfig.npcAnimPrefix,
};

export function createCharacter(
  scene,
  x,
  y,
  name,
  offset = Math.random() * 1000,
) {
  const sprite = scene.add.sprite(x, y, name);
  sprite.setDepth(AnimationConfig.depth);
  sprite.setDisplaySize(AnimationConfig.baseWidth, AnimationConfig.baseHeight);

  // Create a separate hitbox for collision (invisible image with physics body)
  const hitbox = scene.add.image(x, y, name);
  hitbox.setVisible(false);
  scene.physics.add.existing(hitbox);
  hitbox.body.setSize(12, 12);
  hitbox.body.setOffset(2, 2);
  hitbox.body.syncBoundingBox = false;

  sprite.hitbox = hitbox;
  sprite.animOffset = offset;
  sprite.x = x;
  sprite.y = y;
  return sprite;
}

export function handleIdle(sprite, time, config = AnimationConfig) {
  const widthPulse = Math.sin(
    (time + sprite.animOffset) / config.pulsePeriod.width,
  );
  const heightPulse = Math.sin(
    (time + sprite.animOffset) / config.pulsePeriod.height,
  );

  const width = config.idleWidth + widthPulse * config.pulseAmplitude.width;
  const height = config.idleHeight + heightPulse * config.pulseAmplitude.height;

  sprite.setDisplaySize(width, height);
}

export function handleWalking(sprite, time, config = AnimationConfig, direction = null) {
  const widthPulse = Math.sin(
    (time + sprite.animOffset) / config.pulsePeriod.width,
  );
  const heightPulse = Math.sin(
    (time + sprite.animOffset) / config.pulsePeriod.height,
  );

  let height = config.walkHeight + heightPulse * config.pulseAmplitude.height;
  if (direction === "up" || direction === "down") {
    height += 1;
  }

  const width = config.walkWidth + widthPulse * config.pulseAmplitude.width;
  sprite.setDisplaySize(width, height);
}

export function syncSpriteToHitbox(sprite) {
  if (sprite.hitbox) {
    sprite.x = Math.round(sprite.hitbox.x);
    sprite.y = Math.round(sprite.hitbox.y);
  }
}
