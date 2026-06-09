---
name: full-flow
description: Full automation flow - from Qase.io case to a ready-to-run Playwright test (Manual + Senior QA combined)
---

# Full Flow: Manual + Senior QA

A complete automation flow — from Qase.io case to a ready-to-run Playwright test.

## Stage 1: Manuel Agent (The Recon)

Run the Manuel Agent flow:

1. **Qase.io API** — Fetch case details using `QASE_TOKEN` from `.env`.

2. **Authorization** — Log in to pre-prod.crocobet.com using Playwright MCP (`.env` → `SPORT_USERNAME` / `SPORT_USER_PASSWORD`).

3. **Selector Discovery** — Use `browser_navigate` + `browser_snapshot`. Priority: `data-cy` > semantic > web components > CSS class > `getByText()`.

4. **Existing Check** — Look in `locators/` for existing selectors and `pages/` (including `basePage.ts`) for existing methods. Mark as `"existing"` with file path.

5. **API Endpoints** — Capture API calls triggered by each action (for `waitForApiResponse` in tests).

6. **Georgian Texts** — Capture exact UI strings for assertion use in `data/texts.ts`.

7. **Element State** — Document if element is visible, requires scroll, hover, or appears after another action.

8. **URL** — Record the page URL for each step.

9. **Not Found?** — Set `found_selector: null`. Never hallucinate or invent selectors.

10. **Generate `manual_output.json`.**

## Stage 2: Senior QA Engineer (Lead Agent)

After Manual completes its task:

1. **Read `manual_output.json`.**

2. **Existing Selectors & Methods** — If `existing_locator` or `existing_method` is specified, use them directly. No duplicates.

3. **Duplicate Check** — Even if manual_output says "new", verify by checking `pages/` and `locators/` before creating.

4. **Locators** — Add new ones only if `new_locator: true` and confirmed no existing match.

5. **Pages** — Create new methods as needed. Handle `element_state` (scroll, hover) in the method.

6. **Georgian Texts** — Add `ui_text_ge` strings to `data/texts.ts` if not already there.

7. **API Waits** — Use `api_endpoint` with `waitForApiResponse` where specified.

8. **Fixtures** — If a new Page Object is created, update `config/baseConfigFixtures.ts`.

9. **Tests** — Create the `.spec.ts` file in `tests/` directory.

## Test Rules

- **Name:** Georgian (`"WSP-XXXX: ..."`)
- **test.step:** English
- **Imports:** `config/baseConfigFixtures`
- **Credentials:** `data/users.ts`
- **Never use `page.waitForTimeout()`**

For full conventions, refer to CLAUDE.md.
