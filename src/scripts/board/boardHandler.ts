import { Point } from "pixi.js";
import { BoardMatrix, SymbolID } from "../types";
import { getBoardValidActions } from "./actionHandler";
import { rangeArray } from "../utils";
import { getCombinationsInBoard } from './combinationHandler'
import SymbolComponent from "../../components/generic/SymbolComponents";
import { Easing, EasingFunction, Group, Tween } from 'tweedle.js';

export const SYMBOL_SIZE = 48;

export const SYMBOL_MARGIN = 2;

export const BOARD_SIZE = 8;

type MoveParams = {
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
}

const InitialBoard = [
  [1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 1],
]

// isAdjacent函数判断两个位置点是否相邻
export function isAdjacent(point1: Point, point2: Point) {
  const dx = Math.abs(point1.x - point2.x);
  const dy = Math.abs(point1.y - point2.y);
  return (dx + dy) <= 1;
}

// 生成随机symbolId
function getRandomSymbolID(): SymbolID {
  const rand = Math.floor(Math.random() * 5);
  return rand;
}
// 随机Borad函数
function makeRandomBoard(): BoardMatrix {
  return InitialBoard.map((row) => row.map((_) => getRandomSymbolID()));
}

export function copyBoard(board: BoardMatrix): BoardMatrix {
  return [...board.map((arr) => [...arr])];
}

// 清除棋盘中匹配的id，方法是连续的三个中替换第二个数值
function removeBoardCombinations(board: BoardMatrix): BoardMatrix {
  // 1.获取board的副本
  const auxBoard = copyBoard(board);
  // 2.获取到board中的匹配位置数组
  const combinations = getCombinationsInBoard(auxBoard);
  // 3.将匹配到的位置数组进行遍历，获取每个数组中的第二个位置坐标，随后获取该坐标下的临近坐标的id值
  combinations.forEach((points) => {
    const {x, y} = points[1];
    const symbolId = auxBoard[y][x];
    const adjTop = auxBoard[Math.max(y - 1, 0) % 5][x];
    const adjBottom = auxBoard[Math.max(y + 1, 0) % 5][x];
    const adjLeft = auxBoard[y][Math.max(x - 1, 0) %5 ];
    const adjRight = auxBoard[y][Math.max(x + 1, 0) % 5]; 
    // 获取唯一值进行替换
    const option = [0, 1, 2, 3, 4].filter((id) => id !== symbolId && id !== adjTop && id !== adjBottom && id !== adjRight && id !== adjLeft);
    auxBoard[y][x] = option[0];
  })
  // 再次获取匹配位置数组，如果数组的长度>0,则代表仍然存在匹配的位置，则再次执行removeBoardCombination函数
  if(getCombinationsInBoard(auxBoard).length > 0) return removeBoardCombinations(auxBoard);
  // 返回不能存在匹配位置的board
  return auxBoard;
}
// 初始化游戏板
export function makeFirstBoard(): BoardMatrix {
  const randBoard = makeRandomBoard();
  const cleanBoard = removeBoardCombinations(randBoard);
  return cleanBoard;
}

const DefaultMoveParam = { duration: 250, delay: 0, easing: Easing.Quadratic.InOut };

export function animateSymbolToPosition(symbol: SymbolComponent, position: Point, params?: MoveParams): Promise<void> {
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

export async function animateSymbolSwap(origin: SymbolComponent, target: SymbolComponent, params?: MoveParams): Promise<void> {
  const originPoint = new Point(origin.x, origin.y);
  const targetPoint = new Point(target.x, target.y);
  await Promise.all([
    animateSymbolToPosition(origin, targetPoint, params),
    animateSymbolToPosition(target, originPoint, params),
  ]);
}