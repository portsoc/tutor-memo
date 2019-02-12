import TutorMemo from './TutorMemo';

// add a card to an array of cards, if it's not already there
function addCard(cards, id, name, img, reversed) {
  // return if the card is already there
  if (cards.some((c) => c.id === id)) return;

  cards.push({
    id,
    name,
    img,
    reversed, // a reversed card shows image first
  });
}

// every student needs:
//   sRef: student ID - just the number, e.g. 123456
//   forename: string
//   surname: string

window.addTutorMemoCardsFromUoPTutees = (tutees) => {
  if (typeof tutees === 'string') tutees = JSON.parse(tutees); // eslint-disable-line no-param-reassign

  const students = Array.isArray(tutees) ? tutees : tutees.students || [];

  const state = JSON.parse(localStorage.TutorMemo || '{}');
  if (!state.cards) state.cards = [];

  for (const s of students) {
    const id = s.sRef;
    const name = `${s.forename} ${s.surname}`;
    const img = `https://portal-webapps.port.ac.uk/staff/Image?person_id=${s.sRef}`;

    addCard(state.cards, `${id}img`, name, img, false);
    addCard(state.cards, `${id}name`, name, img, true);
  }

  tutorMemoInstance.setState(state);
};

let tutorMemoInstance;
ReactDOM.render(<TutorMemo ref={(x) => { tutorMemoInstance = x; }} />, document.querySelector('main'));
