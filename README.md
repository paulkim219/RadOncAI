# RadOncAI

Single-page AngularJS prototype that mimics an oral boards-style chat between an examiner and a candidate while providing a post-answer rating popup.

## Getting started

1. Open `index.html` in a browser. No build tooling is required—the page loads AngularJS from a CDN.
2. Review the imaging thumbnails on the left, then type your answer to the examiner prompt on the right.
3. After sending an answer, a feedback modal appears where you can record a score (1–5) and actionable notes. Closing or submitting the modal lets you keep iterating on the case.
4. Use the `Reset Case` button in the header to clear the chat and timer.

## File structure

- `index.html` – shell layout, examiner conversation area, rating modal
- `styles.css` – visual styling for desktop and mobile breakpoints
- `app.js` – AngularJS module/controller logic for chat, timer, and rating flow
