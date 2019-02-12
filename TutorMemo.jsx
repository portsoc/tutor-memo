/* global React */
import Card from './Card';

const Fragment = React.Fragment;
const DAY = 1000 * 60 * 60 * 24;

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
          <section>
            <p>No cards to remember, use addTutorMemoCards...() functions.</p>
            <a href="https://portal-webapps.port.ac.uk/staff/myTuteesAction.do" target="_blank" rel="noopener noreferrer">Login here</a>
          </section>
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
          <section className="login">
            <a href="https://portal-webapps.port.ac.uk/staff/myTuteesAction.do" target="_blank" rel="noopener noreferrer">Login here</a>
          </section>
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
          <section className="login">
            <a href="https://portal-webapps.port.ac.uk/staff/myTuteesAction.do" target="_blank" rel="noopener noreferrer">Login here</a>
          </section>
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

export default TutorMemo;
