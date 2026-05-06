/**
 * Dialog Data - All NPC dialog scripts
 *
 * Structure:
 * - Key: NPC identifier
 * - Value: Array of { text, portrait?, isEndOfDialog? }
 *
 * isEndOfDialog: true closes the dialog after this line
 */

/** Dad's dialog */
export const dad = [
  {
    speaker: "Dad",
    text: "Hello Son! This is a much longer text to test the scrolling functionality. It should scroll automatically as the text continues to type out and fill up the dialog box. Let me add even more words to make it scroll properly and test the auto-scroll behavior.",
    isEndOfDialog: true,
  },
];

/** Default export for easy importing */
export default {
  dad,
};
