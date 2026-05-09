# Adding a New Enemy to Act1Scene

---

## Using Helper Methods

Add enemies using `createEnemy()` and `createEnemyWeapon()`. Then use `handleEnemyDeath()` and `updateEnemyAI()`.

---

## 1. `create()` — Spawn the enemy and weapon

```js
this.enemy3 = this.createEnemy(X, Y);
this.enemy3Weapon = this.createEnemyWeapon(this.enemy3);
```
> Change `X, Y` to the desired spawn position.

---

## 2. `update()` — Player attacks

```js
BattleController.attack(this, this.player, this.keys, [this.enemy, this.enemy2, this.enemy3]);
```

---

## 3. `update()` — Handle death and AI

```js
this.handleEnemyDeath(this.enemy3, this.enemy3Weapon);
this.updateEnemyAI(this.enemy3, this.enemy3Weapon, time);
```

---

## Helper Methods

### `createEnemy(x, y)`
Creates enemy with physics, health, and movement flags.

### `createEnemyWeapon(enemy)`
Creates the enemy's weapon sprite (axe).

### `handleEnemyDeath(enemy, weapon)`
Handles death animation and cleanup.

### `updateEnemyAI(enemy, weapon, time)`
Handles all AI: animation, health bar, emote, chase, attack, weapon position.

---

## Quick Reference

| Task | Code |
|---|---|
| Create enemy | `this.createEnemy(x, y)` |
| Create weapon | `this.createEnemyWeapon(enemy)` |
| Death | `this.handleEnemyDeath(enemy, weapon)` |
| AI | `this.updateEnemyAI(enemy, weapon, time)` |

> Each enemy is independent - copy the helper calls for each new enemy.