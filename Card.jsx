/* global React */

const Fragment = React.Fragment;

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

    if (!showImage) {
      // preload the image because it may be needed on the next card
      this.preloadImage = new Image();
      this.preloadImage.src = card.img;
    } else {
      this.preloadImage = null;
    }

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

export default Card;
