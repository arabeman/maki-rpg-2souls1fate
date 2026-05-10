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
  playerHealth: 3,
  returnedFromAct1: false,
  enteredAct1FromAct2: false,
  enteredAct2FromAct3: false,
  leftBeginScene: false,
  dadPosition: { x: 0, y: 0 },
  georgesTalked: false,
  georgesPotionReceived: false,
  georgesUseDialog3Next: false,
  act1ChestPotionTaken: false,
  act1ChestPotionTaken2: false,
  act1ChestPotionTaken3: false,
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
  { speaker: "Dad", text: "... You found it." },
  {
    speaker: "Dad",
    text: "That sword was mine. Back when I thought I could protect everyone.",
  },
  { speaker: "Dad", text: "I was wrong." },
  { speaker: "Dad", text: "I miss your mom." },
  {
    speaker: "Dad",
    text: "If you go... I might lose you too.",
    isEndOfDialog: true,
  },
  { speaker: "Dad", text: "But I won't stop you.", isEndOfDialog: true },
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

export const georgesNpcDialog = [
  {
    speaker: "Georges",
    text: "You... you actually saved me.",
  },
  {
    speaker: "Georges",
    text: "I thought that thing was going to kill me.",
  },
  {
    speaker: "Georges",
    text: "Most people stopped helping each other after the disappearances.",
  },
  {
    speaker: "Georges",
    text: "But you still fought.",
  },
  {
    speaker: "Georges",
    text: "...You remind me of a girl. She used to look at people the same way. Like everyone was worth saving.",
  },
  {
    speaker: "Georges",
    text: "Here. Take this potion.",
  },
  {
    speaker: "Georges",
    text: "You'll need it more than I do.",
    isEndOfDialog: true,
  },
];

export const georgesNpcDialog2 = [
  {
    speaker: "Georges",
    text: "That girl told me she was heading north.",
  },
  {
    speaker: "Georges",
    text: "But... nobody comes back from there.",
  },
  {
    speaker: "Georges",
    text: "Be careful.",
    isEndOfDialog: true,
  },
];

export const georgesNpcDialog3 = [
  {
    speaker: "Georges",
    text: "Press E to drink your potion when you need health.",
    isEndOfDialog: true,
  },
];

export default {
  dadDialogNoSword,
  dadDialogHasSword,
  dadDialogUnlock,
  dadAct1Dialog,
  georgesNpcDialog,
  georgesNpcDialog2,
  georgesNpcDialog3,
};
