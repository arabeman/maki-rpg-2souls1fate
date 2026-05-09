# Adding a New Enemy to Act1Scene

Follow these steps in order. Each step is labelled with where in the file to make the change.

---

## 1. `create()` — Spawn the enemy

```js
this.enemy3 = EnemyController.create(this, X, Y, "enemy");
this.enemy3.health = 3;
this.physics.add.collider(this.player.hitbox, this.enemy3.hitbox);
this.physics.add.collider(
  this.enemy3.hitbox,
  manager.getWallGroup(this, "act_1"),
);
this.enemy3.hitbox.body.setImmovable(false);
this.enemy3.hitbox.body.setCollideWorldBounds(true);
```

> Change `X, Y` to the desired spawn position. Check the map in Tiled if unsure.

---

## 2. `create()` — Give it a weapon sprite

```js
this.enemy3Weapon = this.add.sprite(
  this.enemy3.x + 8,
  this.enemy3.y + 4,
  "axe", // swap for "sword1", "hammer", etc.
);
this.enemy3Weapon.setOrigin(1.5, 0.7);
this.enemy3Weapon.setDepth(this.enemy3.depth + 1);
```

---

## 3. `update()` — Let the player's attacks hit it

Just add the new enemy to the existing array — one call covers all of them:

```js
BattleController.attack(this, this.player, this.keys, [this.enemy, this.enemy2, this.enemy3]);
```

---

## 4. `update()` — Death sequence

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

## 5. `update()` — AI behaviour

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
    if (distToPlayer3 > EnemyBehavior.attackRange) {
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
  if (this.enemy3Weapon) {
    this.enemy3Weapon.setPosition(this.enemy3.x + 8, this.enemy3.y + 4);
    this.enemy3Weapon.setFlipX(this.enemy3.flipX);
  }
}
```

---

## Quick reference

| Thing to change | Variable name pattern |
|---|---|
| Enemy object | `this.enemyN` |
| Weapon sprite | `this.enemyNWeapon` |
| Flash function | `flashEnemyN` |
| Distance var | `distToPlayerN` |
| Spawn position | `X, Y` in `EnemyController.create` |

> **Rule:** every new enemy is fully independent. No enemy's AI or death should be gated behind another enemy's state. Each block stands alone, guarded only by its own `active && !isDying` check.