import { Sprite, Texture, BlurFilter, Point, Assets } from "pixi.js";
import { loadBackground } from "../scripts/assetLoad";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../Manager";

export default class GameBackground extends Sprite {
  private readonly blurFilter: BlurFilter;

  static async makeBackground(): Promise<GameBackground> {
    const background = new GameBackground(await loadBackground());
    return background;
  }

  constructor(texture: Texture) {
    super(texture);
    this.blurFilter = new BlurFilter();
    this.filters = [this.blurFilter];
    this.anchor.set(0.5);
    this.position = new Point(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    this.width = SCREEN_WIDTH;
    this.height = SCREEN_HEIGHT;
  }
}