v1.0.0
This version introduces accounts and cloud sync — the biggest update yet. Sign in with your email to save templates to
the cloud, and access them from any device. If you're offline or the connection fails, the extension works instantly
from your local cache so you're never stuck.

New features:

- Sign in / create an account with email and password
- Templates sync to the cloud automatically
- Sort your templates by name, date created, or last updated

---

v0.5.0 (May 2, 2026)

- New: "Click the Add Note" button shortcut also inserts the filled template directly into LinkedIn's "Add Note" modal
  once it's open
- New: Set a custom character limit, or ignore the limit altogether
- Fix: More reliable detection of LinkedIn's "More" button

v0.4.1
This version includes a major code migration, from Vanilla JS and HTML to a modern stack using Preact, Tailwind, and
CRXJS.

This release also adds accessibility shortcuts to some core actions in LinkedIn:
Alt+C: Open the "Connect" dialog for the current profile
Alt+N: Open the "Add a Note to Your Invitation" dialog
Alt+Shift+S: Send invitation with a note

You can set these shortcuts from chrome://extensions/shortcuts

Other improvements:

- {{companyName}} wildcard fixed.
- Pressing the Tab key when the template is blank and showing the placeholder populates the template with the
  placeholder.

v0.3.0 (March 31, 2026)
LinkedIn pushed BIG update that makes it a lot harder to get information. Good for them! This update fixes a bit of
that:

- Fix fullName parsing
- Fix a few secret weapons

v0.2.0 (March 12, 2026)

- Search your templates - Find the perfect message quickly
- Clickable message wildcards - Insert fields directly into messages
- One-click templates - Select a template and it's ready to use (no save needed)
- {{companyName}} wildcard works better
- New wildcards for the recipient of an open message - Write templates like "Hi {{msgFirstName}}, can you introduce me
  to {{firstName}}?"
- Polish & bug fixes - Improved UI and stability
- New secret weapons
