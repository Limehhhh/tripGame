import { Assets, Color, NineSlicePlane, Text, TextStyle, Texture } from "pixi.js";
import { GameAssets } from "../../scripts/assetLoad";

export type ButtonBorders = {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}

export type ButtonStyle = {
  text: string;
  tint: Color;
  width: number;
  height: number;
  hoverTint?: Color;
  textStyle?: TextStyle;
  borders?: ButtonBorders;
}

export default class ButtonComponent extends NineSlicePlane {
  private readonly style: ButtonStyle;

  public label: Text;

  static borders(vertical: number, horizontal: number): ButtonBorders {
    return {
      top: vertical,
      bottom: vertical,
      left: horizontal,
      right: horizontal,
    };
  }

  constructor(style: ButtonStyle) {
    super(Assets.get(GameAssets.buttonBase), style.borders.left, style.borders.top, style.borders.right, style.borders.bottom);
    this.style = style;
    this.width = style.width;
    this.height = style.height;
    // Make Label
    this.label = new Text(style.text, style.textStyle);
    this.label.anchor.set(0.5);
    this.label.x = style.width / 2;
    this.label.y = style.height / 2;
    this.tint = style.tint;
    this.addChild(this.label);
    this.addListeners();
  }

  private get normalTexture(): Texture {
    return Assets.get(GameAssets.buttonBase);
  }

  private get pressedTexture(): Texture {
    return Assets.get(GameAssets.buttonBasePressed);
  }

  private addListeners(): void {
    this.on('pointerup', this.onRelease, this);
    this.eventMode = 'static';
  }

  private onRelease(): void {
    this.texture = this.normalTexture;
    this.emit('click', null);
  }

}