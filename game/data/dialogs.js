/**
 * Dialog Data - All NPC dialog scripts
 *
 * Structure:
 * - Key: NPC identifier
 * - Value: Array of { text, speaker?, isEndOfDialog? }
 *
 * isEndOfDialog: true closes the dialog after this line
 */

export const GameState = {
  hasWeapon: false,
  exitUnlocked: false,
};

export const dadDialogNoSword = [
  {
    speaker: "Dad",
    text: "Stay inside.",
  },
  {
    speaker: "Dad",
    text: "It's not safe out there anymore.",
  },
  {
    speaker: "Dad",
    text: "I already lost her...",
    isEndOfDialog: true,
  },
  {
    speaker: "Dad",
    text: "I don't want to lose you too.",
    isEndOfDialog: true,
  },
];

export const dadDialogHasSword = [
  {
    speaker: "Dad",
    text: "...",
  },
  {
    speaker: "Dad",
    text: "You found it.",
  },
  {
    speaker: "Dad",
    text: "That sword was mine.",
  },
  {
    speaker: "Dad",
    text: "Back when I thought I could protect everyone.",
  },
  {
    speaker: "Dad",
    text: "I was wrong.",
  },
  {
    speaker: "Dad",
    text: "I miss your mom.",
  },
  {
    speaker: "Dad",
    text: "If you go...",
  },
  {
    speaker: "Dad",
    text: "I might lose you too.",
    isEndOfDialog: true,
  },
  {
    speaker: "Dad",
    text: "But I won't stop you.",
    isEndOfDialog: true,
  },
];

export const dadDialogUnlock = [
  {
    speaker: "Dad",
    text: "...",
  },
  {
    speaker: "Dad",
    text: "Then take it.",
  },
  {
    speaker: "Dad",
    text: "And be careful.",
  },
  {
    speaker: "Dad",
    text: "Come back to me.",
    isEndOfDialog: true,
  },
];

export const dadAct1Dialog = [
  {
    speaker: "Dad",
    text: "Before you go any further... you need to know how to defend yourself.",
  },
  { speaker: "Dad", text: "That sword isn't just for show. Listen carefully." },
  {
    speaker: "Dad",
    text: "Use W A S D to attack. The direction you press determines where you strike.",
  },
  {
    speaker: "Dad",
    text: "Don't swing wildly. Wait between attacks... or you'll leave yourself open.",
  },
  { speaker: "Dad", text: "Try it a few times." },
];

export default {
  dadDialogNoSword,
  dadDialogHasSword,
  dadDialogUnlock,
  dadAct1Dialog,
};
