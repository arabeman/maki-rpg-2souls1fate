export const AnimationConfig = {
  depth: 100,
  baseWidth: 14,
  baseHeight: 14,
  idleWidth: 16,
  idleHeight: 14,
  walkWidth: 14,
  walkHeight: 15,
  pulseAmplitude: { width: 0.6, height: 0.5 },
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
  const sprite = scene.physics.add.sprite(x, y, name);
  sprite.setDepth(AnimationConfig.depth);
  sprite.setDisplaySize(AnimationConfig.baseWidth, AnimationConfig.baseHeight);
  sprite.animOffset = offset;
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

export function handleWalking(sprite, time, config = AnimationConfig) {
  const widthPulse = Math.sin(
    (time + sprite.animOffset) / config.pulsePeriod.width,
  );
  const heightPulse = Math.sin(
    (time + sprite.animOffset) / config.pulsePeriod.height,
  );

  const width = config.walkWidth + widthPulse * config.pulseAmplitude.width;
  const height = config.walkHeight + heightPulse * config.pulseAmplitude.height;

  sprite.setDisplaySize(width, height);
}
