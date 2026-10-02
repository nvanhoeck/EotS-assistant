# Next steps

The two-column PDF fix is committed as `1665ff4` (`fix(ingest): read two-column pages in order where that fixes the rule order`). It contains the extraction change, the re-ingested `chunks.json` and `ingest-report.json`, the tests, and the README and TODO updates.

## On your side

- **Embeddings:** run `npm run embed` with Ollama running. Until then, retrieval uses keywords only.
- **Android dark theme:** you may need `npx expo install expo-system-ui` before it shows up.
- **Device checklist:** the manual phone checklist for the Search feature (Task 8 step 6 of `docs/superpowers/plans/2026-10-01-section-search-reader.md`) is still open.
- **Branch:** decide how to integrate it (merge, PR, or keep).
