# Practical 12: CI/CD Pipeline with GitHub Actions

![CI Pipeline](https://github.com/<your-username>/<your-repo>/actions/workflows/ci.yml/badge.svg)

Every push and pull request to `main` runs **lint → test → build** automatically on GitHub.

> GitHub only reads workflows from `.github/workflows/` **at the repository root**, so push this folder as the root of its own repository. Then replace `<your-username>/<your-repo>` in the badge above.

## Run the same checks locally

```bash
cd backend
npm install
npm run lint
npm test             # needs MongoDB on 127.0.0.1:27017 (or set MONGO_URI)
cd ../frontend
npm install && npm run lint && npm run build
```

## Workflow (`.github/workflows/ci.yml`)

```
on: push / pull_request → main
lint            : checkout → setup-node 22 → npm ci → eslint (backend + frontend)
build-and-test  : needs lint · MongoDB service container
                  checkout → setup-node 22 → npm ci → npm test → frontend build
```

## What's implemented

| Requirement | Where |
| --- | --- |
| Workflow on push to `main` | `.github/workflows/ci.yml` |
| `npm ci` install step | both jobs |
| Automated tests with a clear pass/fail | `backend/tests/api.test.js` (Jest + Supertest, **10 tests**) |
| App split from the server so it can be tested | `backend/app.js` (app) + `backend/server.js` (DB + listen) |
| Deliberately failing run, then fixed | recorded in [`docs/ci.md`](docs/ci.md) |
| **Supplementary:** lint job before the test job | `lint` job, `needs: lint` |
| **Supplementary:** also runs on pull requests to `main` | `on.pull_request` |
| **Supplementary / assignment:** status badge | top of this README |
| **Assignment:** second test for a different endpoint | auth, validation, CRUD and 404 tests |

The linter found two real React bugs (setState inside effects), and both are fixed. See `docs/ci.md`.

After your first push, add screenshots of a red (failed) and a green (passed) run to `docs/`.

## Key questions

* **CI vs CD?** CI automatically builds and tests every change, which is what this practical does. CD also automatically deploys passing builds, which is not done here.
* **Why earlier than manual testing?** It runs on every push, within minutes, on a clean machine. Problems show up while the change is small and the author still remembers it.
* **Wrong test path?** Jest prints "No tests found" and exits 1, which fails the **same step** as a real test failure. Only the log tells the two apart.
