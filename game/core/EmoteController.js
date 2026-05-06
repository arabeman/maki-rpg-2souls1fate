import config from "../maki.config.js";

export const EmoteConfig = {
  offsetY: -8,
  bounceAmplitude: 3,
  bounceSpeed: 0.005,
  fadeSpeed: 0.01,
  defaultDuration: 2000,
};

export function showEmote(scene, target, emoteName, duration = EmoteConfig.defaultDuration) {
  const emoteFile = config.emotes.find((e) => e && e.name === emoteName);
  if (!emoteFile) return null;

  const imageKey = `emote_${emoteName}`;
  const emote = scene.add.image(target.x, target.y + EmoteConfig.offsetY, imageKey);
  emote.setDepth(200);
  emote.setOrigin(0.5, 1);

  scene.tweens.add({
    targets: emote,
    y: emote.y - 2,
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  if (duration > 0) {
    scene.time.delayedCall(duration, () => {
      emote.destroy();
    });
  }

  return emote;
}