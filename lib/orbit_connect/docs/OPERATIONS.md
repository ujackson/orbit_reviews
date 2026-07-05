# Operations

## Suggested metrics

- connection counts by provider and status
- sync latency
- webhook processing latency
- token refresh failures
- 429 and 5xx rates by provider
- oldest pending webhook age

## Suggested recurring jobs

- `OrbitConnect::SweepRefreshableConnectionsJob`
- `OrbitConnect::HealthSweepJob`

## Suggested alerts

- high error rate on a provider
- repeated token refresh failures
- growing pending webhook queue
- stale connections with no sync for > 24h
