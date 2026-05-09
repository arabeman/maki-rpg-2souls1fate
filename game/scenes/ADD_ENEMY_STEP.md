# Adding a New Enemy to Act1Scene

---

## Using Helper Methods (Recommended)

Now you can add enemies using the helper methods `createEnemy()` and `createEnemyWeapon()`.

---

## 1. `create()` — Spawn the enemy and weapon

```js
this.enemy3 = this.createEnemy(X, Y);
this.enemy3Weapon = this.createEnemyWeapon(this.enemy3);
```

> Change `X, Y` to the desired spawn position. Check the map in Tiled if unsure.

---

## 2. `update()` — Let the player's attacks hit it

Add the new enemy to the existing array:

```js
BattleController.attack(this, this.player, this.keys, [this.enemy, this.enemy2, this.enemy3]);
```

---

## 3. `update()` — Death sequence

Copy the enemy2 death block and rename every `enemy2` / `enemy2Weapon` reference to `enemy3` / `enemy3Weapon`:

```js
if (this.enemy3 && this.enemy3.health <= 0 && !this.enemy3.isDying) {
  this.enemy3.isDying = true;
  const flashEnemy3 = () => {
    if (this.enemy3 && this.enemy3.active) {
      this.enemy3.setVisible(!this.enemy3.visible);
      if (this.enemy3Weapon) this.enemy3Weapon.setVisible(this.enemy3.visible);
    }
  };
  flashEnemy3();
  this.time.addEvent({ delay: 80,  callback: flashEnemy3 });
  this.time.addEvent({ delay: 160, callback: flashEnemy3 });
  this.time.addEvent({ delay: 240, callback: flashEnemy3 });
  this.time.addEvent({ delay: 320, callback: () => {
    if (this.enemy3Weapon) { this.enemy3Weapon.destroy(); this.enemy3Weapon = null; }
    if (this.enemy3?.healthHearts) {
      this.enemy3.healthHearts.forEach(h => h?.destroy());
      this.enemy3.healthHearts = [];
    }
    if (this.enemy3) {
      if (this.enemy3.hitbox) {
        this.enemy3.hitbox.body.setVelocity(0);
        this.enemy3.hitbox.destroy();
        this.enemy3.hitbox = null;
      }
      this.enemy3.destroy();
      this.enemy3 = null;
    }
  }});
}
```

---

## 4. `update()` — AI behaviour

Copy the enemy2 AI block and rename to `enemy3`. Place it right after the enemy2 AI block:

```js
if (this.enemy3 && this.enemy3.active && !this.enemy3.isDying) {
  EnemyController.handleAnimation(this.enemy3, time);
  if (this.enemy3.lastHealth !== this.enemy3.health) {
    this.enemy3.lastHealth = this.enemy3.health;
    EnemyController.showHealthBar(this.enemy3);
  }
  EnemyController.updateHealth(this.enemy3, this.enemy3.health);

  const distToPlayer3 = EnemyController.getDistanceToTarget(this.enemy3, this.player);
  if (distToPlayer3 < EnemyBehavior.visionRange && !Dialog.isOpen()) {
    // Show emote and wait before moving
    if (!this.enemy3.canMove && !this.enemy3.enemyEmote) {
      this.enemy3.enemyEmote = showEmote(this, this.enemy3, "exclamations", 0);
      this.time.delayedCall(800, () => {
        if (this.enemy3) this.enemy3.canMove = true;
      });
    }
    if (this.enemy3.canMove) {
      if (distToPlayer3 > EnemyBehavior.attackRange) {
        // Remove emote when starting to move
        if (this.enemy3.enemyEmote) {
          this.enemy3.enemyEmote.destroy();
          this.enemy3.enemyEmote = null;
        }
        EnemyController.chase(this, this.enemy3, this.player);
      } else {
        this.enemy3.hitbox.body.setVelocity(0);
        this.enemy3.anims.stop();
        EnemyController.attack(this, this.enemy3, this.player, this.enemy3Weapon);
      }
    } else {
      this.enemy3.hitbox.body.setVelocity(0);
      this.enemy3.anims.stop();
    }
  } else {
    this.enemy3.hitbox.body.setVelocity(0);
    this.enemy3.anims.stop();
  }
  if (this.enemy3Weapon) {
    this.enemy3Weapon.setPosition(this.enemy3.x + 8, this.enemy3.y + 4);
    this.enemy3Weapon.setFlipX(this.enemy3.flipX);
  }
}
```

Note: The enemy shows an emote when it sees the player, waits 800ms, then moves. The emote disappears when the enemy starts chasing.

---

## Quick reference

| Thing to change | Variable name pattern |
|---|---|
| Enemy object | `this.enemyN` |
| Weapon sprite | `this.enemyNWeapon` |
| Flash function | `flashEnemyN` |
| Distance var | `distToPlayerN` |
| Spawn position | `X, Y` in `this.createEnemy(X, Y)` |

> **Rule:** every new enemy is fully independent. No enemy's AI or death should be gated behind another enemy's state. Each block stands alone, guarded only by its own `active && !isDying` check.