
import { Scene, Math} from 'phaser';
import cardImages from '../assets/*.svg';
import Card from '../objects/Card';

const GUTTER = 20;
const CARD_COLUMNS = 7
const SCORE_VOFFSET = 40
const SCORE_HOFFSET = 140

const asyncSleep = async function(time) {
  return await (new Promise(resolve => setTimeout(resolve, time)));
}

export default class MemoryGame extends Scene
{
  constructor() {
    super('memory-game')
    this.moveSeq = 0
    this.players = [];
  }

  init({ socket, players, playerName }) {
    this.socket = socket;
    this.players = players;
    this.playerIndex = players.findIndex(p=>p.name == playerName);
    this.isFirstPlayer = this.playerIndex == 0;
    this.currentPlayerIndex = 0;
  }

  preload() {
    for(const key in cardImages) {
      this.load.svg(key, cardImages[key])   
    }
  }

  async cardClick(cardIndex) {
    const card = this.cards[cardIndex];
    card.show(true)
    ++this.moveSeq;
    if(this.moveSeq == 1) {
      this.prevCard = card;
    }
    else {
      //it is 2nd move
      await asyncSleep(1000)
      if(this.prevCard.value == card.value) {
        this.prevCard.hide();
        card.hide()
        this.add2Score();
      }
      else {
        this.prevCard.show(false);
        card.show(false);
      }
      this.prevCard = null;
      this.moveSeq = 0;
      this.broadcast("playturn", this.currentPlayerIndex ? 0 : 1);
    }
  }

  showTurnText() {
    if(!this.turnText) {
      const lastColumnCard = this.cards[CARD_COLUMNS-1];
      let x = lastColumnCard.x + lastColumnCard.width;
      let y = lastColumnCard.y;
  
      this.turnText = this.add.text(x, y + lastColumnCard.height, "Text")
                          .setFontSize(24).setStyle({ color: 'cyan'})
    }
    const otherPlayerIndex = this.playerIndex ? 0 : 1;
    this.turnText.text = this.currentPlayerIndex == this.playerIndex ?
                                'My turn' : `${this.players[otherPlayerIndex].name}'s turn`;
  }

  add2Score() {
    const score = ++this.players[this.currentPlayerIndex].score;
    this.scoreTexts[this.currentPlayerIndex].text = score.toString();
  }

  doAction(action) {
    switch(action.name) {
    case "click":
      return this.broadcast('cardclick', action.card.index)
    }
  }

  doClick(gameObject) {
    //in rare event that user clciks fast after opening 2nd card
    if(this.moveSeq == 2) return false; 
    const action = gameObject.getData('action');
    if(action) return this.doAction(action);
    return false;
  }
  
  initEvents() {
    this.socket.on("currentset", (currentSet)=>{
      this.render(currentSet);
      this.renderScoreboard();
      this.broadcast("playturn", this.currentPlayerIndex)
    });

    this.socket.on("playturn", index => {
      //TBD show turn text
      this.currentPlayerIndex = index
      this.input.enabled = this.currentPlayerIndex == this.playerIndex;
      this.showTurnText()
    });

    this.socket.on("cardclick", index=>{
      this.cardClick(index);
    })

    this.input.on('gameobjectup', (pointer, gameObject) => {
      this.doClick(gameObject);
    });

    //shutdown needed as scene.restart refreshes object and 
    //multiple handlers are active which need to be closed
    this.events.on("shutdown", ()=>{
      this.events.off("shutdown");
      this.input.off("gameobjectup");
    });
  }

  getCards() {
    const cardValues = '23456789';
    const cardSuites = 'SH';  //spades and hearts for now

    const frameNames = Object.keys(cardImages)
    frameNames.splice(frameNames.indexOf('BACK'), 1)
    let currentSet = frameNames.filter(n=>cardValues.includes(n[0]) && 
                            cardSuites.includes(n[1]))
    currentSet = Math.RND.shuffle(currentSet)
    return currentSet
  }

  renderScoreboard() {
    const lastColumnCard = this.cards[CARD_COLUMNS-1];
    let x = lastColumnCard.x + lastColumnCard.width;
    let y = lastColumnCard.y;
    this.scoreTexts = []
    for(const p of this.players) {
      this.add.text(x, y, p.name).setFontSize(24).setStyle({ color: 'cyan'})
      const scoreText = this.add.text(x+SCORE_HOFFSET, y, p.score.toString()).setFontSize(24)
                            .setStyle({ color: 'cyan'})
      this.scoreTexts.push(scoreText);
      y += SCORE_VOFFSET;
    }
  }

  render(currentSet) {
    this.cards = [];
    for(let i=0;i<currentSet.length;i++) {
      const card = new Card(this, currentSet[i], i);
      const row = Math.FloorTo(i / CARD_COLUMNS );
      const col = i % CARD_COLUMNS;
      const x = GUTTER + (card.width + GUTTER)*col + card.width/2;
      const y = GUTTER + (card.height + GUTTER)*row + card.height/2;
      card.setPosition(x, y, false);
      this.cards.push(card)
    }
  }

  broadcast(actionName, actionData) {
    this.socket.emit("broadcast", actionName, actionData)
  }

  async create() {
    if(this.isFirstPlayer) {
      const currentSet = this.getCards();
      this.broadcast("currentset", currentSet);
    }
    this.initEvents();
  }
}
