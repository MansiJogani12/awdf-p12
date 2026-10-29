# Caching: response time comparison

These were measured with `npm run benchmark` against a local MongoDB, with **2000 tasks** for one user (about 0.5 MB of JSON per response).
To get the uncached readings, restart the server with `CACHE_ENABLED=false`.

## GET /tasks

| Reading | Cache ON          | X-Cache | Cache OFF | X-Cache  |
| ------- | ----------------- | ------- | --------- | -------- |
| 1       | 49.6 ms           | MISS    | 34.6 ms   | DISABLED |
| 2       | 24.0 ms           | HIT     | 32.6 ms   | DISABLED |
| 3       | 13.9 ms           | HIT     | 29.5 ms   | DISABLED |
| 4       | 15.6 ms           | HIT     | 31.8 ms   | DISABLED |
| 5       | 16.1 ms           | HIT     | 33.9 ms   | DISABLED |
| **Avg of hits (2–5)** | **17.4 ms** |  | **32.5 ms** (all 5) | |

On this machine, a cache hit is about **47% faster** than going to MongoDB.

* The first request is always a MISS. It queries MongoDB, then stores the result.
* Most of what remains in a HIT is Express turning 2000 objects into JSON. The database round-trip is skipped entirely.
* With a remote database (e.g. Atlas), or with only a few tasks, the gap would be bigger. Network latency is then added to every MISS.

## Invalidation check

| Step                         | GET /tasks   | GET /tasks/:id |
| ---------------------------- | ------------ | -------------- |
| First read                   | MISS         | MISS           |
| Second read                  | HIT          | HIT            |
| `PUT /tasks/:id` (complete)  | MISS, shows updated data | MISS, shows updated data |
| `POST /tasks`                | MISS, new task included  | n/a |
| `DELETE /tasks/:id`          | MISS, task gone          | n/a |

No stale data is served after a write.

## Notes for the viva

* **Why invalidate on every write?** Without invalidation, a stale list keeps being served for up to the full TTL (60 s) after an update. That is a correctness bug, not just a performance trade-off.
* **TTL trade-off.** A longer TTL means more hits but a bigger window of staleness if a write path forgets to invalidate. A shorter TTL is fresher but gives fewer hits. 60 s is reasonable for a personal task list because every write invalidates explicitly anyway.
* **Why per-user keys** (`tasks:<userId>`)? Since Practical 7, tasks are private. One shared `all_tasks` key would serve one user's tasks to everyone.
* **Why not for multiple servers?** node-cache lives in one Node process's memory. With two instances behind a load balancer, a write on instance A only clears A's cache, and B keeps serving stale data. It is also lost on restart. A shared cache such as Redis solves both problems.
* **Query optimisation done alongside:**
  * `.lean()` returns plain objects instead of Mongoose documents.
  * A compound index `{ user: 1, createdAt: -1 }` matches the `find({ user }).sort({ createdAt: -1 })` query exactly.
