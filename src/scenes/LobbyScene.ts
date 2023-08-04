import { Assets, Color, Container, Text, TextStyle } from "pixi.js";
import { Manager, SCREEN_HEIGHT, SCREEN_WIDTH } from "../Manager";
import ButtonComponent from "../components/generic/ButtonComponent";
import { GameAssets, GameFont } from "../scripts/assetLoad";
import { IScene } from "../scripts/types";
import { Spine } from 'pixi-spine';
import { GameScene } from "./GameScene";
import { Matrix, gameRules } from '../scripts/types'
import { Easing, Tween } from "tweedle.js";

export class LobbyScene extends Container implements IScene {
  private readonly title: Spine;
  private readonly playButton: ButtonComponent;
  private board: Matrix = [];
  private initialRules: gameRules = {
    limitScore: 50,
    limitTime: 60
  }

  constructor() {
    super();
    this.playButton = this.makePlayButton();
    this.playButton.on('click', this.onPlayClicked, this);
  }

  public async onEnter(): Promise<void> {
    await this.playIntroTween();
  }

  public async onLeave(): Promise<void> {
    // Empty
  }

  public update(): void {

  }
  private onPlayClicked(): void {
    console.log('click')
    Manager.changeScene(new GameScene(this.initialRules))
  }

  private makePlayButton(): ButtonComponent {
    const btn = new ButtonComponent({
      text: 'PLAY',
      width: 130,
      height: 60,
      tint: new Color('#FFFFFF'),
      hoverTint: new Color('#dcdcdc'),
      textStyle: new TextStyle({
        fontFamily: GameFont.Poppins,
        fill: "#000000",
        fontSize: 20,
      }),
      borders: ButtonComponent.borders(3, 3)
    });
    btn.x = SCREEN_WIDTH / 2 - btn.width / 2;
    btn.y = SCREEN_HEIGHT - 130;
    this.addChild(btn);
    return btn;
  }
  private playIntroTween(): Promise<void> {
    return new Promise<void>((resolve) => {
      const y = this.playButton.y;
      this.playButton.y = 1000;
      new Tween(this.playButton)
        .delay(1500)
        .to({ y }, 500)
        .easing(Easing.Cubic.Out)
        .onComplete(() => resolve())
        .start();
    });
  }

}
