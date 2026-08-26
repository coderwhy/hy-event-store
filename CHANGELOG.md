# Changelog

All notable changes to `hy-event-store` are documented in this file.

## Unreleased

### Added

- Add first-party TypeScript declarations for event payloads, state keys,
  actions, and action return values, plus compile-time regression coverage.
- Allow <code>off</code> to cancel a pending <code>once</code> listener by using
  the original callback reference.

## 1.4.0 - 2026-08-19

### Added

- Add automated regression tests and continuous integration for Node.js 18,
  20, 22, 24, and 26.
- Add contribution, security-reporting, and maintenance guidance.

### Changed

- Return action results from `dispatch`, including Promise values, so callers
  can consume or await them. This follows the contribution proposed by
  [@Thunder7991](https://github.com/Thunder7991) in
  [PR #32](https://github.com/coderwhy/hy-event-store/pull/32).
- Validate store options, state keys, action names, event names, and callbacks
  with clearer errors.
- Make multi-state listener registration and removal atomic when validation
  fails.
- Remove the unused Axios development dependency and limit the published
  package to runtime source and project documentation.

### Fixed

- Prevent `once` listeners from skipping the next listener during emission.
- Make `off` safe when an event has no listeners.
- Repair `clear` and `hasEvent` so they operate on the event registry.
- Support event names that overlap with object prototype properties, including
  `constructor`, `toString`, and `__proto__`.

### Compatibility notes

- Existing CommonJS imports remain unchanged.
- State keys must be declared in the initial `state` object. `setState` now
  throws for unknown keys instead of creating values that cannot be observed.
- No runtime dependencies are added.

## 1.3.1 - 2023-04-21

- Previous npm release. Earlier changes were not maintained in a repository
  changelog.
