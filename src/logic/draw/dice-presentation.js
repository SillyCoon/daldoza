import Dice from '../../assets/dice.png';
import Cross from '../../assets/cross.png';
import Two from '../../assets/two.png';
import Three from '../../assets/three.png';
import Four from '../../assets/four.png';

export const DicePresentation = {
  init() {
    this.dice = this._initSprite(Dice);
    this.cross = this._initSprite(Cross);
    this.two = this._initSprite(Two);
    this.three = this._initSprite(Three);
    this.four = this._initSprite(Four);
  },

  getSprite(face) {
    const faceSprite = this._getFaceSprite(face);
    return Promise.all([this.dice, faceSprite]);
  },

  _getFaceSprite(face) {
    switch (face) {
    case 1:
      return this.cross;
    case 2:
      return this.two;
    case 3:
      return this.three;
    case 4:
      return this.four;
    default:
      throw new Error('No such face');
    }
  },

  _initSprite(src) {
    const sprite = new Image();
    sprite.src = src;
    return new Promise((resolve) => {
      sprite.onload = () => {
        resolve(sprite);
      };
    });
  }
};
