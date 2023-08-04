import { Point } from "pixi.js";
import { BoardMatrix, SymbolID, GameCombination } from "../types";
import { copyBoard } from "./boardHandler";

// includesPoint函数判断p是否存在于相邻位置数组中
function includesPoint(arr: Array<Point>, { x, y }: Point): boolean {
    return arr.find((p: Point) => p.x === x && p.y === y) !== undefined;
  }

// uniqueAdd函数实现将值相等且相邻的位置添加进相邻位置数组中
export function uniqueAdd(adjacets: Array<Point>, p: Array<Point>): void {
    p.forEach((point) => {
        if (!includesPoint(adjacets, point)) adjacets.push(point);
      });
}

// getCombinationsInBoard函数获取到board中匹配（相邻且相等）位置数组
export function getCombinationsInBoard(board: BoardMatrix, match = 3): Array<GameCombination> {
    const combs: Array<GameCombination> = [];
    const combPoints: Array<Point> = [];
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board.length; x++) {
        const adjcs = findAdjacents(board, [], new Point(x, y));
        if (!includesPoint(combPoints, new Point(x, y))) {
          if (adjcs.length >= match) {
            combs.push(adjcs);
            combPoints.push(...adjcs);
          }
        }
      }
    }
    return combs;
  }


// getSymbolOn函数，获取对应board的p位置上对应的symbolId
export function getSymbolOn(board: BoardMatrix, { x, y }: Point): number | null {
    if(x < 0 || x >= board.length) return null;
    if( y < 0 || y >= board.length) return null;
    return board[y][x];
}
// 查找相邻位置，返回匹配的相邻的位置数组
// adjacets: 相邻的位置数组
// p：位置
// 返回值相等且相邻的位置数组
function findAdjacents(board: BoardMatrix, adjacents: Array<Point>, p: Point): Array<Point> {
    const sb = getSymbolOn(board, p);
    const testAdjacent = (x: number, y: number) => getSymbolOn(board, new Point(x, y)) === sb && !includesPoint(adjacents, new Point(x, y));
    uniqueAdd(adjacents, [p]);
    if (testAdjacent(p.x + 1, p.y)) findAdjacents(board, adjacents, new Point(p.x + 1, p.y));
    if (testAdjacent(p.x - 1, p.y)) findAdjacents(board, adjacents, new Point(p.x - 1, p.y));
    if (testAdjacent(p.x, p.y + 1)) findAdjacents(board, adjacents, new Point(p.x, p.y + 1));
    if (testAdjacent(p.x, p.y - 1)) findAdjacents(board, adjacents, new Point(p.x, p.y - 1));
    
   
    return adjacents;
}




export function removeCombinationsFromBoard(board: BoardMatrix, combinations: Array<GameCombination>): BoardMatrix {
    const auxBoard = copyBoard(board);
    combinations.forEach((points) =>
      points.forEach(({ x, y }) => {
        auxBoard[y][x] = SymbolID.Empty;
      })
    );
    return auxBoard;
  }