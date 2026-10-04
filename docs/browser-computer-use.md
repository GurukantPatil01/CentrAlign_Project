# Real Browser & Computer Use Architecture

## 1. Overview & Objective

CentrAlign Enterprise Worker incorporates **genuine browser and computer use** powered by Playwright Chromium. Rather than mocking UI activity or displaying static animations, the autonomous worker controls a real browser session against the Acme Enterprise Portal (`/portal/invoices`).

The browser runtime is exposed to the agent planner as first-class tools, subject to safety bounds, semantic selector resolution, structured observations, automated recovery, and visual screenshot checkpoints.

---

## 2. Browser Runtime Abstraction (`backend/app/browser/`)

The browser subsystem is partitioned into modular, single-responsibility components:

```
backend/app/browser/
├── __init__.py           # Public exports (BrowserManager, tools, errors)
├── manager.py            # Thread-safe BrowserManager singleton & worker thread
├── session.py            # Sandboxed BrowserSession, navigation bounds & page lifecycle
├── selectors.py          # Multi-tier resilient semantic selector resolver
├── observations.py       # Structured BrowserObservation extractor & DOM scraper
├── actions.py            # High-level tool action implementations
└── errors.py             # Strongly typed browser error hierarchy
```

### Dedicated Playwright Worker Thread

In FastAPI and AnyIO test environments, HTTP requests and asynchronous tasks execute across dynamic thread pools. Playwright's synchronous API relies on greenlets, which prohibit switching greenlet contexts across distinct OS threads (`greenlet.error: Cannot switch to a different thread`).

To solve this deterministically:
1. `BrowserManager` runs a dedicated `PlaywrightWorker` background thread.
2. All browser interactions are dispatched via a thread-safe `queue.Queue` using `concurrent.futures.Future`.
3. The worker thread owns the Playwright lifecycle, browser context, and page instances cleanly.

---

## 3. Sandboxing & Security Boundaries

CentrAlign enforces strict execution bounds on the browser runtime:

1. **Origin Whitelist**: Navigation is restricted exclusively to sandbox origins (`127.0.0.1`, `localhost`, and `*.internal`). Attempts to navigate to external websites raise `InvalidInputError`.
2. **No Arbitrary Code Execution**: The LLM agent cannot execute arbitrary JavaScript or access host files.
3. **Bounded Timeouts**: All navigation and action operations have explicit timeouts (8,000ms action timeout, 10,000ms navigation timeout).
4. **Isolated Profiles**: Every browser session runs with isolated user data and no persistent credentials.

---

## 4. Registered Browser Tools

The agent interacts with internal web applications exclusively through registered tools in `ToolRegistry`:

| Tool | Parameters | Risk Level | Description |
|------|------------|------------|-------------|
| `browser_open` | `url: str` | LOW | Navigate to an enterprise portal URL within sandbox boundaries. |
| `browser_observe` | *none* | LOW | Extract structured interactive elements, page title, and text content. |
| `browser_click` | `selector: str`, `target?: str` | MEDIUM | Click a button, link, or row using resilient semantic lookup. |
| `browser_type` | `selector: str`, `text: str` | MEDIUM | Type text into an input field or search filter. |
| `browser_select` | `selector: str`, `value: str` | MEDIUM | Select an option in a dropdown selector. |
| `browser_extract` | `selector?: str` | LOW | Extract structured textual data and attributes from a DOM container. |
| `browser_screenshot`| `name?: str` | LOW | Capture a visual PNG checkpoint to the evidence store. |
| `browser_back` | *none* | LOW | Navigate back in browser history. |
| `browser_wait` | `milliseconds: int` | LOW | Pause execution to allow asynchronous DOM renders to complete. |

---

## 5. Resilient Semantic Selectors (`selectors.py`)

To eliminate brittle automation that breaks with trivial DOM structure changes, `resolve_locator` uses a multi-tier fallback strategy:

1. **Direct CSS / Test ID**: Attempts `[data-testid='...']` or raw selector.
2. **Semantic Attributes**: Evaluates `[aria-label='...']`, `[name='...']`, `[id='...']`.
3. **Role & Text Matching**: Resolves buttons and links by visible text (`button:has-text('...')`, `a:has-text('...')`).
4. **Case-Insensitive Visible Text Search**: Normalizes and matches text across visible interactive DOM elements.
5. **Pre-Check for Disabled State**: Detects disabled buttons immediately to prevent unnecessary 8s timeout blocks.

---

## 6. Structured Browser Observations (`observations.py`)

After every browser action, the agent receives a structured observation payload rather than raw HTML:

```json
{
  "url": "http://127.0.0.1:8000/portal/invoices/INV-1024",
  "title": "Invoice INV-1024 - Acme Enterprise Portal",
  "visible_elements": [
    {
      "tag": "button",
      "testid": "process-invoice",
      "role": "button",
      "text": "Process Invoice",
      "disabled": false
    },
    {
      "tag": "div",
      "testid": "invoice-details",
      "role": "div",
      "text": "Invoice Details: INV-1024 ... INR 145,000",
      "disabled": false
    }
  ],
  "text": "Invoice Details: INV-1024\nVendor: Acme Corp\nAmount: INR 145,000\nApproval: APPROVED",
  "action_result": "Clicked 'Process Invoice'",
  "screenshot": "click_3e5c7c1a"
}
```

The planner uses `visible_elements` and `text` to decide the subsequent step in the workflow.

---

## 7. Failure Detection & Automated Recovery

The browser runtime classifies failures into explicit error types:

- `ELEMENT_NOT_FOUND`: Target element was not located on the page.
  - *Recovery*: Agent runs `browser_observe` to inspect current page state, identifies alternative selectors, or reloads.
- `NAVIGATION_TIMEOUT`: Page failed to load within timeout boundary.
  - *Recovery*: Idempotent retry with exponential backoff up to 2 attempts.
- `ACTION_TIMEOUT`: Action blocked (e.g. element obscured or unresponsive).
  - *Recovery*: Checks element visibility/disabled state and retries.
- `STALE_PAGE`: Page state changed out-of-band.
  - *Recovery*: Navigates back or refreshes URL.

---

## 8. Screenshot Checkpoints & Frontend Inspection

Visual checkpoints are stored under `backend/app/browser/screenshots/` and served via FastAPI at `/api/screenshots/{filename}`:
- Checkpoints are captured before and after major mutations (e.g. navigation, invoice processing).
- The frontend `ComputerActivityPanel` renders the real screenshot directly within an interactive mock browser chrome, with zoom/modal capabilities and action metadata.
