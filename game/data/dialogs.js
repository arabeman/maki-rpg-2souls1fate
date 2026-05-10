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
  act2ChestPotionTaken: false,
  totalPotionsReceived: 0,
  raphaelFirstTalkDone: false,
  raphaelMoved: false,
  arthurTalkedAboutGirl: false,
  arthurFirstTalkDone: false,
  arthurMoved: false,
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

export const arthurDialog = [
  {
    speaker: "Arthur",
    text: "Wait...",
  },
  {
    speaker: "Arthur",
    text: "The enemies there are different... more violent. Most people never come back.",
  },
  {
    speaker: "Arthur",
    text: "There was one girl... I saw them take her north, but I couldn't do anything.",
  },
  {
    speaker: "Arthur",
    text: "And your mom... I heard she was somewhere in the south a few days ago.",
  },
  {
    speaker: "Arthur",
    text: "You should carry more potions before going any further.",
    isEndOfDialog: true,
  },
];

export const arthurDialogGirl = [
  {
    speaker: "Arthur",
    text: "The girl...",
  },
  {
    speaker: "Arthur",
    text: "They took her north. She tried to run, but...",
  },
  {
    speaker: "Arthur",
    text: "If you find her... tell her I never stopped trying.",
    isEndOfDialog: true,
  },
];

export const arthurDialogMother = [
  {
    speaker: "Arthur",
    text: "Your mom...",
  },
  {
    speaker: "Arthur",
    text: "I heard she was spotted in the south, a few days ago.",
  },
  {
    speaker: "Arthur",
    text: "She seemed determined. Must be looking for something.",
    isEndOfDialog: true,
  },
];

export const arthurDialogHasPotions = [
  {
    speaker: "Arthur",
    text: "Alright, you're set with potions.",
  },
  {
    speaker: "Arthur",
    text: "Good luck out there. Don't hesitate to come back if you need more info.",
    isEndOfDialog: true,
  },
];

export const arthurDialogFirstHasPotions = [
  {
    speaker: "Arthur",
    text: "Wait... you can't pass without having potions, but...",
  },
  {
    speaker: "Arthur",
    text: "Oh, you already have them! That's great.",
  },
  {
    speaker: "Arthur",
    text: "Alright, you're set. Good luck out there.",
    isEndOfDialog: true,
  },
];

export const raphaelNeedSwordDialog = [
  {
    speaker: "Raphael",
    text: "Stop. The road ahead is worse than anything behind you.",
  },
  {
    speaker: "Raphael",
    text: "That blade won't cut it anymore.",
  },
  {
    speaker: "Raphael",
    text: "Find a stronger sword before you keep going.",
    isEndOfDialog: true,
  },
];

export const raphaelHasSwordDialog = [
  {
    speaker: "Raphael",
    text: "Good. That's a proper sword.",
  },
  {
    speaker: "Raphael",
    text: "I'll step aside. Keep your guard up from here.",
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
  raphaelNeedSwordDialog,
  raphaelHasSwordDialog,
};
