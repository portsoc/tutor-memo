// this is actually JSX

(() => {
  'use strict';

  const DAY = 1000 * 60 * 60 * 24;
  const Fragment = React.Fragment;

  class TutorMemo extends React.Component {
    static findNext(cards) {
      let next = null;
      for (const c of cards) {
        if (next == null || (next.seeNext || 0) > (c.seeNext || 0)) {
          next = c;
        }
      }
      return next;
    }

    constructor(props) {
      super(props);
      if (localStorage.TutorMemo) {
        this.state = JSON.parse(localStorage.TutorMemo);
      } else {
        this.state = {};
      }

      if (!this.state.cards) this.state.cards = [];

      this.fastForward = this.fastForward.bind(this);
      this.setCardResult = this.setCardResult.bind(this);
    }

    componentDidUpdate() {
      // save current state
      localStorage.TutorMemo = JSON.stringify(this.state);
    }

    setCardResult(oldCard, level) {
      this.setState((state) => {
        const card = Object.assign({}, oldCard);
        const cards = state.cards.map((c) => (c.id === card.id ? card : c));

        const levelObj = this.props.levels.find((l) => l.name === level);

        const now = Date.now();
        let lastDuration = card.lastDuration || 1;
        if (lastDuration < 1) lastDuration = 1;

        let nextDuration = levelObj.f(lastDuration);
        nextDuration = this.props.fudge(nextDuration);
        nextDuration = Math.round(nextDuration);
        // constrain to min 1 max maxDaysBetweenRepeats
        nextDuration = Math.max(1, nextDuration);
        nextDuration = Math.min(this.props.maxDaysBetweenRepeats, nextDuration);

        card.lastDuration = nextDuration;
        card.seeNext = now + (nextDuration - 0.5) * DAY;

        return { cards };
      });
    }

    fastForward() {
      this.setState((state) => {
        const next = TutorMemo.findNext(state.cards);
        if (!next) return {};

        const shift = (next.seeNext || 0) - Date.now();
        if (shift < 0) return {}; // the next card is already due by now

        const cards = state.cards.map((c) => {
          const retval = Object.assign({}, c);
          retval.seeNext = (c.seeNext || 0) - shift;
          return retval;
        });

        return { cards };
      });
    }

    render() {
      const heading = <h1>Tutor-Memo</h1>;
      if (!this.state.cards || this.state.cards.length === 0) {
        return (
          <Fragment>
            {heading}
            <p>No cards to remember, use addTutorMemoCards...() functions</p>
          </Fragment>
        );
      }

      const now = Date.now();
      const today = this.state.cards.filter((c) => (c.seeNext || 0) <= now);

      const cardCount = <p>{`Cards: ${this.state.cards.length}`}</p>;

      if (today.length === 0) {
        const next = TutorMemo.findNext(this.state.cards);
        return (
          <header>
            {heading}
            <section className="stats">
              { cardCount }
              <p>
                {`Next in ${Math.ceil(((next.seeNext || 0) - now) / DAY)} day(s)`}
                <button onClick={this.fastForward} type="button">Fast forward</button>
              </p>
            </section>
          </header>
        );
      }

      const next = today[Math.floor(Math.random() * today.length)];
      return (
        <Fragment>
          <header>
            {heading}
            <section className="stats">
              { cardCount }
              <p>{`Today: ${today.length}`}</p>
            </section>
          </header>
          <Card card={next} levels={this.props.levels} setResult={this.setCardResult} />
        </Fragment>
      );
    }
  }

  TutorMemo.defaultProps = {
    maxDaysBetweenRepeats: 30,
    fudge: (x) => x + 4 * Math.random() - 2,
    levels: [
      {
        name: 'Forgotten',
        f: () => 1,
      },
      {
        name: 'Difficult',
        f: (x) => 0.5 * x,
      },
      {
        name: 'Easy',
        f: (x) => 2 * x,
      },
    ]
  };

  class Card extends React.Component {
    constructor(props) {
      super(props);
      this.state = { flipped: false };

      this.setFlipped = this.setFlipped.bind(this);
    }

    setFlipped(flipped) {
      this.setState({ flipped });
    }

    render() {
      const card = this.props.card;
      const flipped = this.state.flipped;
      const showImage = flipped || card.reversed;
      const showName = flipped || !card.reversed;
      const show = (
        <Fragment>
          {showImage && <img src={card.img} alt="card face" />}
          {showName && <p>{card.name}</p>}
        </Fragment>
      );

      const buttons = [];
      if (flipped) {
        for (const l of this.props.levels) {
          buttons.push(
            <button
              key={l.name}
              type="button"
              onClick={() => { this.setFlipped(false, false); this.props.setResult(card, l.name); }}
            >
              {l.name}
            </button>
          );
        }
      } else {
        buttons.push(
          <button
            type="button"
            key="_flip"
            autoFocus
            onClick={() => this.setFlipped(!flipped, true)}
            className="flip"
          >
            Flip
          </button>
        );
      }

      return (
        <section className="card">
          {show}
          <section className="buttons">
            {buttons}
          </section>
        </section>
      );
    }
  }

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

  window.addTutorMemoCardsFromUoPTutees = (tutees) => {
    if (typeof tutees === 'string') tutees = JSON.parse(tutees); // eslint-disable-line no-param-reassign

    const students = Array.isArray(tutees) ? tutees : tutees.students || [];

    const state = JSON.parse(localStorage.TutorMemo || '{}');
    if (!state.cards) state.cards = [];

    for (const s of students) {
      const id = s.sRef;
      const name = `${s.forename} ${s.surname}`;
      const img = `https://portal.webapps.port.ac.uk/staff/Image?person_id=${s.sRef}`;

      addCard(state.cards, `${id}img`, name, img, false);
      addCard(state.cards, `${id}name`, name, img, true);
    }

    tutorMemoInstance.setState(state);
  };

  let tutorMemoInstance;
  ReactDOM.render(<TutorMemo ref={(x) => { tutorMemoInstance = x; }} />, document.querySelector('main'));
})();
