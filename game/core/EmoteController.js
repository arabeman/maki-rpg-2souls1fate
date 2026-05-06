import config from "../maki.config.js";

export const EmoteConfig = {
  offsetY: -20,
  bounceAmplitude: 3,
  bounceSpeed: 0.005,
  fadeSpeed: 0.01,
  defaultDuration: 2000,
};

export function showEmote(scene, target, emoteName, duration = EmoteConfig.defaultDuration) {
  const emoteFile = config.emotes.find((e) => e && e.name === emoteName);
  if (!emoteFile) return null;

  const emote = scene.add.image(target.x, target.y + EmoteConfig.offsetY, emoteFile.file);
  emote.setDepth(200);
  emote.setOrigin(0.5, 1);
  emote.setAlpha(0);

  scene.tweens.add({
    targets: emote,
    alpha: 1,
    y: emote.y - EmoteConfig.bounceAmplitude,
    duration: 200,
    yoyo: true,
    repeat: -1,
  });

  if (duration > 0) {
    scene.time.delayedCall(duration, () => {
      scene.tweens.add({
        targets: emote,
        alpha: 0,
        duration: 200,
        onComplete: () => emote.destroy(),
      });
    });
  }

  return emote;
}