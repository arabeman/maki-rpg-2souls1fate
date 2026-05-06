# Dialog Component

Dialog system for NPCs with typewriter effect, using Pixel font "Press Start 2P".

## Usage

```js
import { Dialog } from "./utils/Dialog.js";

// Create dialog data
const dadDialog = [
  { text: "Good morning, son!", portrait: "dad_happy" },
  { text: "Did you sleep well?", portrait: "dad_neutral" },
  { text: "Don't forget to eat breakfast!", portrait: "dad_concerned", isEndOfDialog: true },
];

// In NPC creation
this.dad = NPCController.createWithDialog(this, x, y, "dad", "dad");

// In update/click handler
if (player touches dad) {
  Dialog.open(this, dadDialog);
}

// Close dialog
Dialog.close();
```

## Methods

- `open(scene, dialogData)` - Open dialog with array of dialog items
- `close()` - Close current dialog
- `next()` - Advance to next dialog line
- `isOpen()` - Check if dialog is currently open

## Dialog Data Structure

```js
{
  text: "Dialog text to display",
  portrait: "portrait_sprite_key", // optional
  isEndOfDialog: false, // if true, closes dialog after this item
}
```

## Font

"Press Start 2P" from Google Fonts - pixel/retro style font.