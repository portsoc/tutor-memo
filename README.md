# Tutor-Memo - remember your tutees

Spaced-learning cards for remembering people and their names

https://jacek.soc.port.ac.uk/tutor-memo

## First installation
1. in another tab go to [your tutees](https://portal-webapps.port.ac.uk/staff/myTuteesAction.do)
2. go to your browser's Javascript Console
 1. in chrome on mac: `cmd-alt-j` (on windows it might be `ctrl-shift-j`)
 2. in safari you need to enable "Develop menu" in advanced settings, then cmd-alt-c

3. copy the following code in:

  ```
  `
  addTutorMemoCardsFromUoPTutees(atob('`
  +btoa(JSON.stringify((await(await
  fetch('https://portal-webapps.port.ac.uk/staff/api/esb/staffMember/tutees'))
  .json()).students.map(
  s=>({sRef:s.sRef,forename:s.forename,
  surname:s.surname}))))+`'))
  `;
  ```


4. wait for output, copy it into the clipboard
5. go to [tutor memo](https://jacek.soc.port.ac.uk/tutor-memo)
6. go to Javascript Console
7. paste from clipboard, close JS console
8. **this browser will now remember your tutees and your progress remembering them**

## Usage
* The page shows you either a name or a picture.
  * If the pictures don't work, log into your tutees in some other thab that you can then close.
* You try to remember the face or the name. Then you flip the card.
* Judge how easy the association was to make: easy, difficult, or couldn't remember.
* The system will show you the card again in a few days, depending on how well you already know it.
