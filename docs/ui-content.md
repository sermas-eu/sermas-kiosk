# Content the avatar shows

Besides speaking, the avatar shows content next to it: text, images, links, a block of
buttons, a quiz. This page covers the interactive ones and the notices the kiosk shows.

## Buttons and quizzes are single use

A click on a button or a quiz answer is published to the API as a UI interaction
(`app/<appId>/ui/interaction/avatar`). The API treats each block of buttons, and each
quiz, as single use: after the first click it no longer matches the others. The kiosk
follows that:

- **A block of buttons** (the welcome menu, the choices of a task) disappears once one
  of its buttons is clicked, together with the card around it.
- **A quiz** keeps its question and only the chosen answer, disabled. The avatar then
  comments on the answer.

The kiosk remembers which blocks were used for the whole page, so a block stays hidden
when the chat history or the subtitles are redrawn. To pick another option, the visitor
asks the avatar again and it shows a new block.

How the API matches clicks and what each one triggers is described in the SERMAS API
documentation:
[UI interactions](https://github.com/sermas-eu/sermas-api/blob/main/docs/ui-interactions.md).

## Notices while listening

- **"Sorry, I didn't catch that."** The last voice turn was dropped: the speech was too
  short, too quiet or unrecognised, or the API judged it was not addressed to the
  avatar (overheard chatter). The avatar does not reply to it; the kiosk shows the
  notice for a few seconds and listens again.
- **The keyboard opens by itself** when the API reports a noisy room (several voice
  turns it could not hear): the avatar suggests typing, and the on-screen keyboard
  opens.

See [Overheard speech and noisy rooms](https://github.com/sermas-eu/sermas-api/blob/main/docs/overheard-speech.md)
in the SERMAS API documentation for when the API reports each case.
