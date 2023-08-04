import { Container, Point, Ticker } from "pixi.js";
import { Matrix, gameRules, SymbolID, GameAction, GameCombination, GameRules } from '../scripts/types';
import { makeFirstBoard, BOARD_SIZE, SYMBOL_SIZE, SYMBOL_MARGIN } from '../scripts/board/boardHandler';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../Manager';
import SymbolComponent from "../components/generic/SymbolComponents";

import { isAdjacent } from "../scripts/board/boardHandler";
import { applyActionOnBoard, createAction, getActionHash, getActionTargetPoint, getBoardValidActions } from '../scripts/board/actionHandler'
import {  getCombinationsInBoard, removeCombinationsFromBoard } from "../scripts/board/combinationHandler";
import { BoardGroup, UIGroup, animateBoardImpact, animateScoreFeedback, animateSymbolSwap, animateSymbolToPosition, fadeComponent, animateSymbolExplode } from "../scripts/animationHandler";

export class GameScene extends Container{

    private board: Matrix = [];
    private boardContainer: Container;
    private readonly rules: GameRules;
    private ui: GameUI;
    private tappedSymbol: SymbolComponent | null = null;
    private targetSymbol: SymbolComponent | null = null;
    private symbols: Array<SymbolComponent> = [];
    // 存储有效行为的hash值
    private validActions: Array<number> = [];
    private refillSymbols: Record<number, Array<SymbolComponent>> = {};

    private _processing = false;

    private get processing(): boolean {
        return this._processing;
      }
    
      private set processing(val: boolean) {
        this._processing = val;
        this.symbols.forEach((sb) => {
          sb.eventMode = val ? 'none' : 'static';
        });
      }


    constructor(rules: GameRules) {
        super();
        this.rules = rules;
        // makeFirstBoard()函数初始化随机borad，并将匹配的位置清理掉
        this.board = makeFirstBoard();
        // 初始化区域容器
        this.boardContainer = this.createBoardContainer();

        this.boardContainer.scale = { x: 1.3, y: 1.3 };
        this.addChild(this.boardContainer);
        this.calculateValidActions();
        Ticker.shared.add(this.update, this);
        this.processing = false;
    }

    private calculateValidActions(): void {
        const actions = getBoardValidActions(this.board);
        this.validActions = actions.map((action) => getActionHash(action));
        console.log('  VALID ACTIONS -----------------------------------------', this.validActions);
      }

    public async onEnter(): Promise<void> {
        
      }
    
      public async onLeave(): Promise<void> {
        // Empty
      }
    
      public update(): void {

      }
    private getPositionForPoint({x, y}: Point): Point {
        const ratio = SYMBOL_MARGIN + SYMBOL_SIZE;
        return new Point(x * ratio, y * ratio);
    }
    
    // onSymbolTap函数当鼠标按下时触发
    private onSymbolTap(symbol: SymbolComponent): void {
      console.log('按下触发的tappedSymbol:---------------------------------', symbol);
      this.tappedSymbol = symbol
    }
    // onSymbolEnter函数当鼠标进入symbol的范围时触发
    private onSymbolEnter(symbol: SymbolComponent): void {
        // if(!this.tappedSymbol) return;
        // // 如果范围内的symbol不等于按下的symbol并且他们两个相邻
        // if (this.tappedSymbol !== symbol && isAdjacent(symbol.boardPos, this.tappedSymbol.boardPos)){
        //   this.targetSymbol = symbol;
        //   console.log('进入范围了的targetSYMBOL:--------------------------------', this.targetSymbol)
        // }
        // else if (this.tappedSymbol === symbol) {
        //   this.targetSymbol = null;
        // }
        if (!this.tappedSymbol) return;
    if (this.tappedSymbol !== symbol && isAdjacent(symbol.boardPos, this.tappedSymbol.boardPos))
      this.targetSymbol = symbol;
    else if (this.tappedSymbol === symbol)
      this.targetSymbol = null;
    }

    

    // onSymbolRelease函数当鼠标在symbol上抬起时触发
    private onSymbolRelease(): void {
      console.log('release 出发啦');
      
        // // 如果存在tappedSymbol与targetSymbol
        // if(this.tappedSymbol && this.targetSymbol) {
        //     // 创建行为
        //     const action = createAction(this.tappedSymbol.boardPos, this.targetSymbol.boardPos)
        //     console.log('创建的行为：----------------------------------', action);
            
        //     // 处理行为 判断行为和可用性和非可用性
        //     this.processAction(action);
        //     this.tappedSymbol = null;
        //     this.targetSymbol = null;
        //     this.updateSymbolInputFeedback();
        // }
        if (this.tappedSymbol && this.targetSymbol) {
          // take action
          const action = createAction(this.tappedSymbol.boardPos, this.targetSymbol.boardPos);
          this.processAction(action);
        }
        this.tappedSymbol = null;
        this.targetSymbol = null;
        this.updateSymbolInputFeedback();
        
    }

    private updateSymbolInputFeedback(): void {
      this.symbols.forEach((sb) => {
        const isHighlighted = sb === this.tappedSymbol || sb === this.targetSymbol;
        sb.width = isHighlighted ? SYMBOL_SIZE + 5 : SYMBOL_SIZE;
        sb.height = isHighlighted ? SYMBOL_SIZE + 5 : SYMBOL_SIZE;
      });
    }

    private getSymbolOnPoint({ x, y }: Point): SymbolComponent | undefined {
      // 从symbol数组中挑选出原symbol
        return this.symbols.find((symbol) => symbol.boardPos.x === x && symbol.boardPos.y === y);
      }
    

      private updateSymbolsToBoardData(): void {
        this.board.forEach((row, rowIdx) => row.forEach((sbID, colIdx) => {
          const point = new Point(colIdx, rowIdx);
          const symbol = this.getSymbolOnPoint(point);
          if (!symbol) return;
          symbol.boardPos = point;
          symbol.symbolID = sbID;
        }));
      }

      private addSymbolToRefill(symbol: SymbolComponent, point: Point): void {
        const { x } = symbol.boardPos;
        if (!this.refillSymbols[x]) this.refillSymbols[x] = [];
        this.refillSymbols[x].push(symbol);
        symbol.boardPos = point;
        symbol.symbolID = SymbolID.Empty;
      }

      private async processCombinations(combinations: Array<GameCombination>): Promise<void> {
        if (combinations.length <= 0) return;
        this.board = removeCombinationsFromBoard(this.board, combinations);
        const feedbackPromises = [];
        await Promise.all(combinations.map((combination, idx) => {
          return Promise.all(combination.map(async (point) => {
            const symbol = this.getSymbolOnPoint(point);
            if (!symbol) return
            await animateSymbolExplode(symbol);
            this.addSymbolToRefill(symbol, new Point(point.x, -1))
          }))
        }));
        await Promise.all(feedbackPromises);
        this.updateSymbolsToBoardData();
        await this.processCombinations(getCombinationsInBoard(this.board));
      }

    private async processAction(action: GameAction): Promise<void> {
      this.processing = true;
      const targetPoint = getActionTargetPoint(action);
      const symbol = this.getSymbolOnPoint(action.point);
      const targetSymbol = this.getSymbolOnPoint(targetPoint);
      const isValid = this.validActions.includes(getActionHash(action))
      if (isValid && symbol && targetSymbol) {
 
        console.log('有效！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！');
        
        this.board = applyActionOnBoard(this.board, action);
        // await animateSymbolSwap(symbol, targetSymbol);
        symbol.boardPos = targetSymbol.boardPos;
        targetSymbol.boardPos = action.point;
        const combinations = getCombinationsInBoard(this.board);
        await this.processCombinations(combinations);
        this.calculateValidActions();
      } else {

        await animateSymbolSwap(symbol, targetSymbol);
        await animateSymbolSwap(targetSymbol, symbol);
      }
       this.processing = false;
    }

    // 根据位置及id获取symbol对象

    private makeSymbol(symbolId: SymbolID, size: number, pos: Point): SymbolComponent {
      const symbol = new SymbolComponent(symbolId, size, pos);
      symbol.on('pointerdown', () => this.onSymbolTap(symbol));
      symbol.on('pointerenter', () => this.onSymbolEnter(symbol));
      symbol.on('pointerup', () => this.onSymbolRelease());
      symbol.on('pointerupoutside', () => this.onSymbolRelease());
      symbol.eventMode = this.processing ? 'none' : 'static';
      return symbol;
    }

    private createBoardContainer(): Container {
        // 创建新的容器
        const container = new Container();
        container.x = SCREEN_WIDTH / 2;
        container.y = SCREEN_HEIGHT / 2;
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            const symbolId = this.board[r][c];
            const boardPos = new Point(c, r);
            const symbol = this.makeSymbol(symbolId, SYMBOL_SIZE, boardPos);
            symbol.position = this.getPositionForPoint(new Point(c, r));
            this.symbols.push(symbol);
            container.addChild(symbol);
          }
        }
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;
        return container;
      }
}