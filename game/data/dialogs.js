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
  act2ChestPotionTaken2: false,
  totalPotionsReceived: 0,
  raphaelFirstTalkDone: false,
  raphaelMoved: false,
  ameliaSisterTalked: false,
  arthurTalkedAboutGirl: false,
  arthurFirstTalkDone: false,
  arthurMoved: false,
  act2ChestPotionTaken3: false,
  act2ChestPotionTaken4: false,
  act2ChestPotionTaken5: false,
  act2ChestPotionTaken6: false,
  act2HiddenPotionTaken: false,
  cyclopsTeleported: false,
  cyclopsDialogCompleted: false,
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
    text: "Good. That sword should do the job.",
  },
  {
    speaker: "Raphael",
    text: "Alright, I’ll let you pass. Stay alert out there.",
  },
  {
    speaker: "Raphael",
    text: "Oh, and you can press TAB to switch weapons.",
    isEndOfDialog: true,
  },
];

export const ameliaSisterDialog = [
  {
    speaker: "Amelia’s Sister",
    text: "So… you finally made it here.",
  },
  {
    speaker: "Amelia’s Sister",
    text: "This place is hidden for a reason. Out there, things are not safe anymore. I’m staying here to survive… and to wait for news about my sister, Amelia.",
  },
  {
    speaker: "Amelia’s Sister",
    text: "She went north before everything got worse. I haven’t heard from her since.",
  },
  {
    speaker: "Amelia’s Sister",
    text: "If you’re going after her… then you’ll need to be prepared.",
  },
  {
    speaker: "Amelia’s Sister",
    text: "Take what you need from that chest… but promise me you’ll save her.",
  },
  {
    speaker: "Amelia’s Sister",
    text: "And one more thing… Amelia used to talk about you. More than I expected.",
  },
  {
    speaker: "Amelia’s Sister",
    text: "If you find her in the north… tell her how you really feel about her.",
    isEndOfDialog: true,
  },
];

/** Cyclops (Act 3) — dialogs from cyclops narrative; branches for later quests. */

export const cyclopsDialogOnHit = [
  { speaker: "Cyclops", text: "Why!!" },
  { speaker: "Cyclops", text: "Nuh uh... Nuh uh..." },
  { speaker: "Cyclops", text: "Me no hurt anyone!" },
  { speaker: "Cyclops", text: "I just want quiet place..." },
  { speaker: "Cyclops", text: "Tree... rock... mountain..." },
  {
    speaker: "Cyclops",
    text: "Me like cactus... they strong... they quiet...",
  },
  { speaker: "Cyclops", text: "Beauty of life..." },
  { speaker: "Cyclops", text: "All beautiful fur Eye to see." },
  { speaker: "Cyclops", text: "You know place... where cactus grow?" },
  { speaker: "Cyclops", text: "If yes... I go there.", isEndOfDialog: true },
];

export const cyclopsDialogOnFoundCactusPlace = [
  { speaker: "Cyclops", text: "…You found it." },
  { speaker: "Cyclops", text: "Cactus place..." },
  { speaker: "Cyclops", text: "Quiet... perfect..." },
  { speaker: "Cyclops", text: "I stay there.", isEndOfDialog: true },
];

export const cyclopsDialogOnAlreadyVisited = [
  { speaker: "Cyclops", text: "You know cactus place..." },
  { speaker: "Cyclops", text: "Then I don’t block your way." },
  { speaker: "Cyclops", text: "I go there instead.", isEndOfDialog: true },
];

export const heroChoiceThoughtDialog = [
  { text: "I need to make a choice now…" },
  { text: "South leads to my mother… North leads to Amelia…" },
  { text: "There’s no way to reach both in time." },
  {
    text: "If I choose wrong… it might already be too late for the other.",
    isEndOfDialog: true,
  },
];

export const act2ChestPotionTaken = "act2ChestPotionTaken";
export const act2ChestPotionTaken2 = "act2ChestPotionTaken2";
export const act2ChestPotionTaken3 = "act2ChestPotionTaken3";
export const act2ChestPotionTaken4 = "act2ChestPotionTaken4";
export const act2ChestPotionTaken5 = "act2ChestPotionTaken5";
export const act2ChestPotionTaken6 = "act2ChestPotionTaken6";

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
  act2ChestPotionTaken,
  act2ChestPotionTaken2,
  act2ChestPotionTaken3,
  act2ChestPotionTaken4,
  act2ChestPotionTaken5,
  act2ChestPotionTaken6,
  cyclopsDialogOnHit,
  cyclopsDialogOnFoundCactusPlace,
  cyclopsDialogOnAlreadyVisited,
};
