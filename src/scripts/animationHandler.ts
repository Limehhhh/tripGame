import { Container, DisplayObject, IPointData, Point, Text } from 'pixi.js';
import { Easing, EasingFunction, Group, Tween } from 'tweedle.js';

import SymbolComponent from "../components/generic/SymbolComponents";
import FireFXComponent from '../components/generic/FireFXComponent';


export const BoardGroup = new Group();

export const UIGroup = new Group();

type MoveParams = {
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
}

const DefaultMoveParam = { duration: 250, delay: 0, easing: Easing.Quadratic.InOut };

export function animateSymbolToPosition(symbol: SymbolComponent, position: Point, params?: MoveParams): Promise<void> {
  console.log('animateSymbolToPosition开启动画啦----------------------------------------------');
  
  // 对动画设置缓动函数、延迟时间以及动画时间，延迟时间可以保证动画完成后执行其他操作
  const { duration, delay, easing } = { ...DefaultMoveParam, ...params };
  return new Promise<void>((resolve) => {
    symbol.alpha = 1;
    new Tween(symbol)
      .to({ x: position.x, y: position.y }, duration)
      .easing(easing)
      .onComplete(() => setTimeout(resolve, delay))
      .start()
  });
  
}


export function animateSymbolExplode(symbol: SymbolComponent): Promise<void> {
  // FireFXComponent.spawnFireFX(new Point(symbol.x, symbol.y), symbol.parent);
  return new Promise<void>((resolve) =>
    new Tween(symbol)
      .to({ scale: 4, alpha: 0 }, 800)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => resolve())
      .start()
  );
}

export async function animateSymbolSwap(origin: SymbolComponent, target: SymbolComponent, params?: MoveParams): Promise<void> {
  // 获取位置信息
  const originPoint: Point = new Point(origin.x, origin.y);
  const targetPoint: Point = new Point(target.x, target.y);
  // 开启动画
  await Promise.all([
    animateSymbolToPosition(origin, targetPoint),
    animateSymbolToPosition(target, originPoint)
  ])
  console.log('animateSymbolSwap动画开启啦————————————————————————————————————————');
  
}





