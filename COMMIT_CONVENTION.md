# Commit Convention

This project follows a simple and consistent commit message convention inspired by Conventional Commits.

---

## ✨ Format

```
<type>(optional-scope): <short description>
```

### Example

```
feat(auth): add Google login
fix(api): handle null response
docs: update README
```

---

## 📌 Rules

* Use **lowercase** for type and description
* Keep description **short (max ~72 chars)**
* Use **imperative mood** (e.g. "add", not "added")
* No period at the end
* One purpose per commit

---

## 🧱 Types

| Type     | Description                       |
| -------- | --------------------------------- |
| feat     | New feature                       |
| fix      | Bug fix                           |
| docs     | Documentation only                |
| style    | Formatting (no code change)       |
| refactor | Code improvement (no feature/fix) |
| perf     | Performance improvement           |
| test     | Add/update tests                  |
| chore    | Maintenance (deps, config, build) |

---

## 🧩 Scope (optional)

Scope helps specify where the change happened:

```
feat(auth): add login
fix(ui): button alignment issue
```

Common scopes:

* auth
* api
* ui
* db
* config

---

## 📝 Body (optional)

Use when more context is needed:

```
feat(payment): add stripe integration

implement checkout session
handle success and cancel flows
```

---

## ⚠️ Breaking Changes

```
feat(api)!: change user response format
```

Or:

```
feat(api): change user response format

BREAKING CHANGE: user object structure updated
```

---

## ✅ Good Examples

```
feat: add dark mode
fix(auth): prevent crash on login
refactor(api): simplify validation logic
```

---

## ❌ Bad Examples

```
update stuff
fixed bug
WIP
.
```

---

## 🚀 Tips

* Commit often, but keep commits meaningful
* Avoid mixing unrelated changes
* Write commits as if someone else will read them later (they will)

---
