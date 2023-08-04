import { Point } from "pixi.js";
import { GameAction, BoardMatrix, GameCombination, Direction } from "../types";
import { BOARD_SIZE, copyBoard } from "./boardHandler";
import { getCombinationsInBoard } from "./combinationHandler";

/**
 * Transforms an action object to a hash, so it can be easily stored and compared
 */

// createAction函数 创建游戏行为，包含起始位置和方向
export function createAction(point1: Point, point2: Point): GameAction {
  const topLeft = point1.x <= point2.x && point1.y <= point2.y ? point1 : point2;
  const dY = Math.abs(point1.y - point2.y);
  return {
    point: topLeft,
    direction: dY === 0 ? Direction.Horizontal : Direction.Vertical,
  };
}

export function getActionHash(action: GameAction): number {
  const { x, y } = action.point;
  const dirN = action.direction === Direction.Horizontal ? 0 : 1;
  const index = 8 * y + x;
  return index + dirN;
}

export function getActionTargetPoint(action: GameAction): Point {
  const { direction, point} = action;
  console.log('getActionTargetPoint!!!!!!!!!!!!!!!!!!!!!')
  // 根据方向来获取target位置
  return direction === Direction.Horizontal ? new Point(point.x + 1, point.y) : new Point(point.x, point.y + 1);
}


export function applyActionOnBoard(board: BoardMatrix, action: GameAction): BoardMatrix {
  const { point } = action;
  const auxBoard = copyBoard(board);
  const targetPoint = getActionTargetPoint(action);
  const symbol = auxBoard[point.y][point.x];
  const targetSymbol = auxBoard[targetPoint.y][targetPoint.x];
  auxBoard[targetPoint.y][targetPoint.x] = symbol;
  auxBoard[point.y][point.x] = targetSymbol;
  return auxBoard;
}

function getSwapCombinations(board: BoardMatrix, action: GameAction): Array<GameCombination> {
  // 按照行为进行交换，返回匹配组合
  const { point } = action;
  const auxBoard = copyBoard(board);
  const targetPoint = getActionTargetPoint(action);
  if (targetPoint.x > board.length - 1 || targetPoint.y > board.length - 1) return [];
  const initialSymbol = auxBoard[point.y][point.x];
  const targetSymbol = auxBoard[targetPoint.y][targetPoint.x];
  auxBoard[point.y][point.x] = targetSymbol;
  auxBoard[targetPoint.y][targetPoint.x] = initialSymbol;
  return getCombinationsInBoard(auxBoard);
}

export function getBoardValidActions(board: BoardMatrix): Array<GameAction> {
  // 创建行为进行交换，查看是否存在匹配组合，存在且为有效行为
  const validActions: Array<GameAction> = [];
  for(let y = 0 ; y< BOARD_SIZE; y++) {
    for(let x = 0; x < BOARD_SIZE; x++) {
      const hAction: GameAction = { direction: Direction.Horizontal, point: new Point(x, y)};
      if(getSwapCombinations(board, hAction).length > 0 ) validActions.push(hAction);
      const vAction: GameAction = {direction: Direction.Vertical, point: new Point(x, y)};
      if(getSwapCombinations(board, vAction).length > 0 ) validActions.push(vAction);
    }
  }
  return validActions;
}