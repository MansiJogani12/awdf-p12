# Event-driven notifications: console evidence

This was recorded with `NOTIFY_DELAY_MS=2000`, i.e. a simulated slow notification handler.

## What the client saw

```
POST /tasks               -> 201 in 0.006 s
POST /tasks (fail-notify) -> 201 in 0.021 s
DELETE /tasks/:id         -> 200 in 0.004 s
```

The API answered in **6 ms**, even though the notification work takes **2000 ms**.

## Server console (log order)

```
POST /tasks - 2026-10-21T08:07:34.134Z
[API] Response sent at 2026-10-21T08:07:34.137Z                 <- response first
[Listener] task-created received at 2026-10-21T08:07:34.138Z
POST /tasks - 2026-10-21T08:07:34.193Z
[API] Response sent at 2026-10-21T08:07:34.195Z
[Listener] task-created received at 2026-10-21T08:07:34.195Z
DELETE /tasks/6ad872c6ab43c2a1dc218820 - 2026-10-21T08:07:34.306Z
[Notification] Task "Send weekly report" was deleted by ev@t.com at 2026-10-21T08:07:35.324Z
[Notification] Task "Send weekly report" created for ev@t.com | finished at 2026-10-21T08:07:36.153Z (after 2000 ms)
[Notification error] Notification service rejected "fail-notify demo" at 2026-10-21T08:07:36.200Z
```

* `[API] Response sent` (…34.137) is logged **2 seconds before** the notification finishes (…36.153).
* While the first notification was still "sending", the server handled two more requests.
* The `fail-notify` task still got a `201`. Its failure was caught by the `error` listener, and the server kept running.

## Why emit() doesn't block the response

* `emit()` calls each listener **synchronously**, but these listeners are `async`.
* Each listener runs until its first `await` (the simulated 2 s delay). Then `emit()` returns.
* The rest of the listener is scheduled on the event loop and runs later.
* Because `res.json()` is called before `emit()`, the response is already on its way regardless.

## If the notification lived inside the route

If the route did `await sendNotification()` before `res.json()`, every `POST /tasks` would take **2000 ms+**. The user would wait for an email they don't care about, and a notification failure would turn a successful save into an error response.

## Why not EventEmitter in production at scale

* Events live only in this process's memory. If the server crashes or restarts mid-notification, that event is lost.
* There are no retries, no persistence, and no way to spread work across several servers.
* A message queue (RabbitMQ, BullMQ on Redis, SQS) adds durability, retries and horizontal scaling. That is the next step past this lab.
