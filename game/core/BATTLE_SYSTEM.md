# Simple Battle System

## Controls

| Action | Key |
|---|---|
| Move Up | W |
| Move Down | S |
| Move Left | A |
| Move Right | D |
| Attack Up | ↑ |
| Attack Down | ↓ |
| Attack Left | ← |
| Attack Right | → |

The player can:
- move with WASD
- attack with arrow keys at the same time

Example:
- move left with A
- attack right with →

---

# Battle Idea

Combat is real-time.

When the player presses an arrow key:
1. the arm turns to the attack direction
2. the weapon swings
3. damage is applied if enemy is hit
4. attack cooldown starts
5. player must wait before attacking again

The attack speed controls how fast the player can spam attacks.

Example:
- very fast weapon = almost no delay
- slow weapon = long delay before next attack

Each weapon changes:
- range
- speed
- damage

Weapons are found during exploration.

---

# Weapons

## Sword 1

Small starter sword.

| Stat | Value |
|---|---|
| Range | 1 tile |
| Speed | Very Fast |
| Delay | 0.15s |
| Damage | Low |

### Feel
Fast and easy to spam.

---

## Sword 2

Balanced sword.

| Stat | Value |
|---|---|
| Range | 1.5 tiles |
| Speed | Fast |
| Delay | 0.25s |
| Damage | Medium |

### Feel
Balanced attack rhythm.

---

## Sword 3

Heavy sword.

| Stat | Value |
|---|---|
| Range | 2 tiles |
| Speed | Medium |
| Delay | 0.45s |
| Damage | High |

### Feel
Strong but slower attacks.

---

## Sword 4

Rare strong sword.

| Stat | Value |
|---|---|
| Range | 2 tiles |
| Speed | Fast |
| Delay | 0.20s |
| Damage | Medium-High |

### Feel
Fast powerful weapon.

---

# Axe

Strong weapon with medium speed.

| Stat | Value |
|---|---|
| Range | 1.5 tiles |
| Speed | Medium |
| Delay | 0.50s |
| Damage | High |

### Feel
Heavy powerful attacks.

---

# Dual Axes

Two small axes.

| Stat | Value |
|---|---|
| Range | 1 tile |
| Speed | Very Fast |
| Delay | 0.12s |
| Damage | Medium |

### Feel
Very fast combo attacks.

---

# Hammer

Slow but very strong.

| Stat | Value |
|---|---|
| Range | 1.5 tiles |
| Speed | Slow |
| Delay | 0.80s |
| Damage | Very High |

### Feel
Big damage but hard to spam.

---

# Enemy Hit Reaction

When enemies are hit:
- small knockback
- small flash effect

This makes combat feel better.

---

# Goal

Simple combat:
- easy controls
- responsive attacks
- different weapon feeling
- exploration reward