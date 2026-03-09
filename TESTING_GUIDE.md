# Manual Testing Guide - All Features v1

This guide covers testing for 5 new features implemented in the `release/all-features-v1` branch.

## Summary of Features

1. **Searchable Template List** - Filter templates by name or content in real-time
2. **Clickable Wildcards** - Click wildcard tags to insert them into the template
3. **Entire Template Row Clickable** - Full row selection instead of just text
4. **Template Selection Bug Fix** - Switching templates now properly updates selection for copying
5. **Keyboard Commands** - Keybindable commands for "Connect" and "Add Note" buttons

---
NOTES: copying to clipboard doesn't work. It throws at content.js:144 (copyToClipboard). Couldn't tell you why.

## Feature 1: Searchable Template List
NOTES:
- narrowing the search changes the size of the search results (of course) which sometimes changes the scroll position within the plugin
– Pressing ESCAPE in the search field closes the extension. 
  - I'm okay with not having a "clear search" key like this. But let's add a clear (X) button in the field
- single result shouldn't show the bottom line of the row
- no results shouldn't show the empty box (between "recent templates" and "no templates match") 
- 
### What Changed
- Added a search input field at the top of the template list
- Templates are filtered in real-time as you type
- "No results" message appears when search yields no matches
- Press Escape to clear the search

### How to Test

1. **Basic Search**
   - Open the extension popup
   - In the search field above the template list, type part of a template name (e.g., "cover")
   - ✓ Verify: Only templates matching that text appear in the list
   - ✓ Verify: Other templates are hidden

2. **Search by Content**
   - Type text that appears in a template's body (not just the title)
   - ✓ Verify: Templates containing that text are shown

3. **Case Insensitive**
   - Search for text in different cases (e.g., "Cover", "COVER", "cover")
   - ✓ Verify: All variations return the same results

4. **Clear Search**
   - Type in the search field, then press Escape
   - ✓ Verify: Search field clears and all templates are visible again

5. **No Results**
   - Search for something that doesn't exist (e.g., "xyzabc123")
   - ✓ Verify: "No results found" message appears
   - ✓ Verify: Template list is hidden

6. **Auto-Clear on Selection**
   - Perform a search to filter templates
   - Click on one of the filtered templates
   - ✓ Verify: Search field clears automatically after selection

---

## Feature 2: Clickable Wildcards
NOTES: 
- This doesn't work at all. "Uncaught ReferenceError: insertWildcard is not defined" at line popup.js:543. Maybe this is a git issue.
- Let's make the whole wildcards section collapsible. The template edit and list/search are way more important
### What Changed
- Wildcard tags (like `{firstName}`, `{lastName}`, etc.) are now clickable
- Clicking a wildcard inserts it at the cursor position in the template textarea

### How to Test

1. **Identify Wildcards**
   - Open the extension popup
   - Look at the bottom section for wildcard tags (they appear as colored badges/tags)
   - These are clickable elements

2. **Click Wildcard**
   - Click in the template textarea to position your cursor
   - Click on a wildcard tag (e.g., `{firstName}`)
   - ✓ Verify: The wildcard text is inserted at the cursor position

3. **Insert Multiple**
   - Place cursor at different positions in the template
   - Click different wildcard tags multiple times
   - ✓ Verify: Each wildcard is inserted correctly at the cursor location

4. **Undo/Edit**
   - Insert a wildcard by mistake
   - ✓ Verify: You can undo (Cmd+Z or Ctrl+Z) to remove it

---

## Feature 3: Entire Template Row Clickable

### What Changed
- Previously, only the template title text was clickable
- Now the entire row (including padding/background) is clickable

### How to Test

1. **Click Anywhere on Row**
   - Hover over a template item in the list
   - Click on the title text
   - ✓ Verify: Template loads into the editor

2. **Click on Row Padding**
   - Hover over a template item
   - Click on the left/right padding area of the row (not the text, not the delete button)
   - ✓ Verify: Template loads into the editor

3. **Cursor Feedback**
   - Hover over different parts of a template row
   - ✓ Verify: Cursor changes to pointer throughout the entire row
   - ✓ Verify: Only the delete button has its own click behavior

4. **Don't Interfere with Delete**
   - Hover over the delete button (trash icon on the right)
   - ✓ Verify: Delete button still works independently
   - ✓ Verify: Clicking delete doesn't load the template

---

## Feature 4: Template Selection Bug Fix
NOTES: I'm not sure you understood this bug. The UI selection works, but when you do the copy shortcut  it copies the previously selected template

### What Changed
- When switching between templates, the UI now properly marks which template is selected
- Previously, you had to click "Save" before the selection showed for copying

### How to Test

1. **Switch Templates**
   - Have at least 2 saved templates
   - Click on Template A to load it
   - ✓ Verify: Template A is visually highlighted/selected in the list
   - Click on Template B to load it
   - ✓ Verify: Template B is now highlighted/selected
   - ✓ Verify: Template A is no longer highlighted

2. **Verify Selection Without Saving**
   - Load a template without making any edits
   - Do NOT click Save
   - ✓ Verify: The loaded template shows as selected in the list

3. **Draft vs Saved State**
   - Make edits to a template without saving
   - ✓ Verify: It shows "(edited)" in the list
   - ✓ Verify: The edited version shows as selected
   - Click another template without saving the edits
   - ✓ Verify: Original template is no longer marked as edited
   - ✓ Verify: New template is selected

---

## Feature 5: Keyboard Commands (Connect & Add Note)
NOTES: Whoa this works great! It does occur to me that any page has tons of "Connect" buttons. Here below we're on Samantha Byrnes' page. The shortcuts worked correctly, but it's probably a good idea to alter the selector, either to use the "primary" one (rather than the muted one), or to include the name of the person on the page in the selector itself.
<button aria-label="Invite Samantha Byrnes to connect" id="ember884" class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view VmOwFqmNXewfxzXlWMmRNrYiernxWhrJsw" type="button">        <svg role="none" aria-hidden="true" class="artdeco-button__icon " xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" data-supported-dps="16x16" data-test-icon="connect-small">
<!---->    
    <use href="#connect-small" width="16" height="16"></use>
</svg>


<span class="artdeco-button__text">
    Connect
</span></button>

<button aria-label="Invite Alyssa Stoddard to connect" id="ember970" class="artdeco-button artdeco-button--muted artdeco-button--2 artdeco-button--secondary ember-view" type="button">        <svg role="none" aria-hidden="true" class="artdeco-button__icon " xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" data-supported-dps="16x16" data-test-icon="connect-small">
<!---->    
    <use href="#connect-small" width="16" height="16"></use>
</svg>


<span class="artdeco-button__text">
    Connect
</span></button>


### What Changed
- Added two new commands that can be bound to keyboard shortcuts:
  - `click-connect`: Clicks the "Connect" button on LinkedIn profiles
  - `click-add-note`: Clicks the "Add note" button on LinkedIn profiles

### How to Test

1. **Verify Commands Exist**
   - Check `manifest.json` for the two new commands:
     - `"connect"` with description "Click the Connect button"`
     - `"addNote"` with description "Click the Add Note button"
   - ✓ Verify: Both are present in the commands section

2. **Navigate to LinkedIn Profile**
   - Go to any LinkedIn profile (public or your own)
   - Look for the "Connect" button (usually near the top)
   - Look for the "Add note" button (usually appears after clicking Connect or in a dropdown)

3. **Test Connect Command** (if accessible via Chrome DevTools)
   - Open Chrome DevTools Console in the extension context
   - The command executes JavaScript that finds and clicks: `[aria-label^="Invite "][aria-label$=" to connect"]`
   - ✓ Verify: Command logic correctly targets the Connect button

4. **Test Add Note Command** (if accessible via Chrome DevTools)
   - The command executes JavaScript that finds and clicks: `[aria-label="Add a note"]`
   - ✓ Verify: Command logic correctly targets the Add Note button

5. **Command File Verification**
   - Check `background.js`: Contains the command handlers
   - Check `content.js`: Contains the click execution logic
   - ✓ Verify: Both files have been updated

---

## Complete Testing Checklist

- [X] Template search filters by name
- [X] Template search filters by content
- [X] Template search is case-insensitive
- [-] Escape clears search
- [X ] "No results" message appears correctly
- [X] Search clears when selecting a template
- [-] Clicking wildcard inserts it into template
- [-] Multiple wildcards can be inserted
- [X] Entire template row is clickable (not just text)
- [X] Cursor shows pointer throughout row
- [X] Delete button still works independently
- [?] Template switching shows correct selection immediately
- [?] Selection shows without saving
- [?] Draft/edited state displays correctly
- [X] Connect command is defined
- [X] Add Note command is defined

---

## Edge Cases to Test

1. **Empty Search**
   - Search field is empty → All templates shown

2. **Special Characters**
   - Templates with special characters in names
   - Search for special characters
   - ✓ Verify: Search still works correctly

3. **Long Template Names**
   - Very long template titles
   - ✓ Verify: Row is still fully clickable

4. **Empty Templates**
   - Template with empty content but a title
   - Search for text in title
   - ✓ Verify: Found correctly

5. **Multiple Matching Templates**
   - Search returns multiple matches
   - Click one to load it
   - ✓ Verify: Selected correctly, others deselected

---

## Browser Console Checks

If you see any errors in the browser console while testing:
1. Open DevTools (F12 or Cmd+Option+I)
2. Check the Console tab for errors
3. ✓ Verify: No JavaScript errors appear during normal operation

---

## Rollback Information

If issues are found, the individual feature branches are:
- `feature/template-search-ui` - Search and row clickability
- `fix/template-selection` - Template selection bug fix
- `fix/template-selection-bug` - Keyboard commands
- `main` - Original code without changes

All changes are on `release/all-features-v1` branch.
