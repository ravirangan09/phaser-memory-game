const CARD_SCALE = 0.4;

export default class Card {
  constructor(scene, key, index) {
    this.key = key;
    this.scene = scene;
    this.index = index;
    this.init();
  }

  init() {
    const lookup = { 'A': 1, 'T': 10, 'J': 11, 'Q': 12, 'K': 13 };
    const numStr = this.key[0];
    this.suite = this.key[1];
    this.color = (this.suite == 'C' || this.suite == 'S') ? 'black' : 'red'; 
    // eslint-disable-next-line no-prototype-builtins
    this.value = lookup.hasOwnProperty(numStr) ? lookup[numStr] : parseInt(numStr);
    this.image = this.scene.add.image(0, 0, 'BACK').setScale(CARD_SCALE)
                          .setVisible(false).setInteractive()
                          .setData('action', { 'name': 'click', 'card': this })
    this.open = false;
    this.openTextureKey = this.key; 
    this.closeTextureKey = 'BACK';
  }

  get width() {
    return this.image.displayWidth;
  }

  get height() {
    return this.image.displayHeight;
  }

  setPosition(x, y, open) {
    this.open = open;
    this.image.setPosition(x,y).setVisible(true)
      .setTexture(open ? this.openTextureKey : this.closeTextureKey);
  }

  get x() {
    return this.image.x;
  }

  get y() {
    return this.image.y;
  }

  hide() {
    this.image.setVisible(false);
  }
 
  show(open) {
    if(open && !this.open) {
      this.image.setTexture(this.openTextureKey);
    }
    if(!open && this.open) {
      this.image.setTexture(this.closeTextureKey);
    }
    this.open = open;
  }

}
