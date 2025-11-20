# Contributing Guide

This project is developed by Rhea, Makhabat, and Trisha.
To keep our code clean and avoid conflicts, please follow these steps every time you work.

## 1. Before You Start Working

Always update your local main branch:

```bash
git checkout main
git pull origin main
```

Then create a new branch for your task using one of these formats:

- `feat/<your-task>`
- `fix/<bug-name>`
- `ui/<frontend-change>`
- `backend/<backend-change>`
- `docs/<documentation>`

### Examples

- `feat/chat-history`
- `ui/update-sidebar`
- `backend/refactor-supabase`

### Command

```bash
git checkout -b feat/my-task
```

## 2. While You Are Working

Save your progress:

```bash
git add .
git commit -m "Explain what you changed"
```

Write clear commit messages.

Push your branch:

```bash
git push -u origin feat/my-task
```

Next time:

```bash
git push
```

## 3. Opening a Pull Request (PR)

After pushing your branch:

1. Go to the GitHub repo
2. Click "Compare & Pull Request"
3. Make sure the target branch is `main`
4. Add a clear title and description
5. Assign at least one reviewer:
    - @rhea-aucharaz
    - @makhabat
    - @trisha

Only after approval will the PR be merged.

## 4. Merging PRs

After your PR is approved:

1. A reviewer merges it
2. Or you can merge it if you created the PR (depending on settings)

Then update your main:

```bash
git checkout main
git pull origin main
```

## 5. After Finishing a Task

Once your branch is merged, delete your feature branch:

```bash
git branch -d feat/my-task
```

## 6. If You See a Conflict

Don't panic — it is normal.

### Steps

1. Pull latest main:
    ```bash
    git pull origin main
    ```

2. Merge main into your branch:
    ```bash
    git checkout feat/my-task
    git merge main
    ```

3. Open VS Code:
    ```bash
    code .
    ```

4. VS Code will show options:
    - Accept Current
    - Accept Incoming
    - Accept Both

5. Pick what makes sense

6. After fixing:
    ```bash
    git add .
    git commit
    git push
    ```

Your PR updates automatically.

## 7. Don't Push Directly to Main

All changes MUST go through a PR.
Never use:

```bash
git push origin main
```

Even if GitHub allows it, don't do it.

## 8. How We Divide Our Work (Suggested)

- **Backend + Supabase** → Rhea (primary), Makhabat (secondary)
- **Frontend UI/UX** → Trisha (primary), Rhea (secondary)
- **Testing & Documentation** → Makhabat (primary)

But everyone can work on anything, this is just to prevent chaos.

## 9. If Something Breaks

- Write in the group chat
- Or open a GitHub issue
- Or ping one of us on the PR

## 10. Summary (Fast Version)

```bash
git checkout main
git pull origin main
git checkout -b feat/my-task

# work...
git add .
git commit -m "message"
git push

# open PR -> review -> merge

git checkout main
git pull origin main
git branch -d feat/my-task
```

## Benefits

This workflow ensures:

- No broken main branch
- No conflicts exploding
- All work is reviewed
- The project stays clean and organized

