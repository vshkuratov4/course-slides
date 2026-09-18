# Adding a new note

Everything on the site renders from **`data/courses.json`**. Three steps:

## 1. Drop the files in

- PDF → `pdfs/YourFile.pdf`
- Optional preview image → `previews/YourFile.png` (same name, `.png`).
  If it's missing the panel just skips the thumbnail.

## 2. Add one entry to `data/courses.json`

Find the domain (COMP, ELEC, …). Add a course if it's new, then the note:

```json
{
  "code": "ELEC 275",
  "name": "Principles of Electrical Engineering",
  "notes": [
    {
      "title": "Week 2 — Nodal Analysis",
      "file": "ELEC275_Week02_Nodal_Analysis.pdf",
      "description": "One or two sentences shown under the title.",
      "date": "2026-09-25"
    }
  ]
}
```

Counts, bubbles and the "soon" state all update automatically.
To add a whole new domain, copy any entry in `domains` (code, name,
accent color, empty `courses` list) — it gets a bubble automatically.

## 3. Upload the PDF as a Release asset (for download counting)

GitHub does **not** count downloads of plain files on Pages. It does count
release-asset downloads, and the site prefers the release link when one exists:

1. Repo → **Releases** → **Draft a new release** (or edit an existing one).
2. Tag: anything, e.g. `elec275-w02`.
3. Attach the PDF — **the filename must match `file` in the JSON exactly.**
4. Publish.

If you skip this, the note still works; the download button just serves the
file from `pdfs/` and no count is shown.

## 4. Push

```
git add -A && git commit -m "Add ELEC 275 week 2" && git push
```

The live site updates in ~1 minute (hard-refresh: the Pages cache lasts 10 min).
