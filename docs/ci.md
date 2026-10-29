# CI pipeline: failing vs passing run

`.github/workflows/ci.yml` has two jobs:

```
git push origin main
        │
        ▼
  lint ──────────────► build-and-test (needs: lint)
  • npm ci (backend)     • MongoDB service container (mongo:7)
  • eslint backend       • npm ci + npm test (Jest + Supertest, 10 tests)
  • npm ci (frontend)    • npm ci + npm run build (frontend)
  • eslint frontend
        │
        ▼
  ✅ green check  /  ❌ red X  on the commit
```

## 1. Deliberately broken test → red X

In `tests/api.test.js`, the expected status was changed from `200` to `201`:

```
FAIL tests/broken.test.js
  ● health and routing › GET / returns 200 (BROKEN ON PURPOSE)

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 200

      at Object.toBe (tests/broken.test.js:25:28)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 9 passed, 10 total
exit code: 1
```

Jest exits with code **1**. GitHub Actions marks the "Run backend tests" step as failed, skips the remaining steps, and shows a red X on the commit.

## 2. Test fixed → green check

```
Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        1.034 s
```

Exit code **0**, so every step passes and the commit gets a green check.

> The output above was recorded locally with the same commands the workflow runs. After you push, add your own screenshots from the **Actions** tab:
> `docs/ci-failed.png` (red X) and `docs/ci-passed.png` (green check).

## 3. The linter caught real bugs

Adding ESLint (with `eslint-plugin-react-hooks`) to the pipeline flagged two errors in the frontend, and both were fixed:

* `auth.jsx` called `setUser(null)` synchronously inside an effect. The user is now **derived** (`token ? user : null`) instead.
* `Tasks.jsx` reset `loading` and `error` inside the fetch effect. That reset now happens in the **Retry click handler**.

Both caused an extra render pass on every change.

## Viva notes

* **CI vs CD.** Continuous Integration builds and tests every push automatically, and that is what this practical does. Continuous Deployment would go one step further and automatically release passing builds (e.g. push the Docker images from Practical 11 and deploy them). That step is not included here.
* **Why it catches problems earlier.** Every push is tested within minutes, on a clean machine. A bug is found while the change is still small and fresh, not days later during a manual pre-release check.
* **Wrong test path vs real failure.** If the test path were wrong, Jest would print "No tests found" and exit 1, failing at the **same step**. The log tells you which it is, so read the log, not just the red X.
* **A failing lint job stops the pipeline.** `build-and-test` has `needs: lint`, so it never starts.
