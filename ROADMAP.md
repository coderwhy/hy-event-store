# Roadmap

`hy-event-store` is returning to active maintenance through small, reviewable
changes. The immediate goal is to improve correctness and project health while
keeping the public API compatible.

## v1.4.0 — stability and maintenance

- Fix `clear`, `hasEvent`, and safe listener removal in the event bus
  ([#30](https://github.com/coderwhy/hy-event-store/issues/30),
  [#33](https://github.com/coderwhy/hy-event-store/issues/33)).
- Return synchronous and asynchronous action results from `dispatch`
  ([#29](https://github.com/coderwhy/hy-event-store/issues/29),
  [#31](https://github.com/coderwhy/hy-event-store/issues/31),
  [#32](https://github.com/coderwhy/hy-event-store/pull/32)).
- Add automated regression tests and a supported Node.js CI matrix.
- Improve package metadata, security reporting, contribution guidance, and API
  documentation.

## After v1.4.0

These items need API design or compatibility research before implementation:

- Add first-party TypeScript declarations and compile-time coverage
  ([#25](https://github.com/coderwhy/hy-event-store/issues/25)).
- Document and test CommonJS, ESM, and Mini Program import paths
  ([#27](https://github.com/coderwhy/hy-event-store/issues/27)).
- Evaluate a read-only state getter
  ([#26](https://github.com/coderwhy/hy-event-store/issues/26)).
- Explore an opt-in full snapshot for `onStates`
  ([#24](https://github.com/coderwhy/hy-event-store/issues/24)).

## Maintenance principles

- Prefer focused pull requests with regression tests.
- Preserve backward compatibility unless a major release is justified.
- Document behavior changes and migration steps in release notes.
- Treat Issue and Pull Request triage as part of project maintenance.
