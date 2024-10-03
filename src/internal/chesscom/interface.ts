import { IPrincipalVariation, Line } from "../position";
import { EClassification, IChessboard, IChessboardArrow, IChessboardEffect, IChessboardHandler } from "../types/chessboard";
import { AnalysisUI } from "./ui";

type TEventType =
    | "all"
    | "Create"
    | "CreateGame"
    | "DeletePosition"
    | "LineUpdated"
    | "Load"
    | "ModeChanged"
    | "Move"
    | "MoveBackward"
    | "MoveForward"
    | "SelectLineEnd"
    | "SelectLineStart"
    | "SelectNode"
    | "TimeControlUpdated"
    | "Undo"
    | "UpdateOptions"
    | "PluginAdded"
    | "PluginRemoved";

interface IGameEvent {
    data: any;
    type: TEventType;
}

type TEffectType =
    | "Custom"
    | "BestMove"
    | "Blunder"
    | "Book"
    | "Brilliant"
    | "CheckmateBlack"
    | "CheckmateWhite"
    | "Correct"
    | "Critical"
    | "DrawBlack"
    | "DrawWhite"
    | "Excellent"
    | "FastWin"
    | "Forced"
    | "FreePiece"
    | "Gamechanger"
    | "Good"
    | "GreatFind"
    | "Inaccuracy"
    | "Incorrect"
    | "Mate"
    | "Miss"
    | "MissedWin"
    | "Mistake"
    | "ResignBlack"
    | "ResignWhite"
    | "Sharp"
    | "Takeback"
    | "Threat"
    | "TimeoutBlack"
    | "TimeoutWhite"
    | "Undo"
    | "Winner"
    | "WinnerWhite"
    | "Interesting"
    | "Warning"
    | "Equal";

type TMarkingType = "arrow" | "effect" | "highlight";

interface IMarking {
    type: TMarkingType;
    key?: string; // "arrow|e2e4", "effect|e4"
    node?: boolean | { line: number; move: number }; // set to true will make it hidden when moving forward/backward in the game
    persistent?: boolean; // set to false when you want it to be removed when user interact with the board
    data: {
        from?: string;
        to?: string;
        square?: string;
        color?: string;
        opacity?: number; // between 0 and 1
        type?: TEffectType;
        animated?: boolean;
        path?: string; // svg path for effect
    };
    tags?: string[];
}

interface IGameHistory {
    from: TSquare;
    to: TSquare;
    promotion: TPromotionPiece;
    san: string;

    beforeFen: string;
    fen: string;

    piece: TPiece;
    flags: number;

    hash: number[];
    wholeMoveNumber: number; // move number in notation (floor(num/2))
}

// game eco theory
interface GameECO {
    ml: string; // moves by theory, in full notation, ex: "e2e4 c7c5 g1f3 a7a6 c2c3 b7b5"
    m: string; // moves by theory, in san, ex: "1.e4 c5 2.Nf3 a6 3.c3 b5"
    n: string; // theory name, ex: "Sicilian Defense: O'Kelly, Venice, Ljubojević Line"
    u: string; // theory name, ex: "Sicilian-Defense-OKelly-Venice-Ljubojevic-Line"
}

interface IGameOptions {
    allowMarkings: boolean;
    analysisHighlightColors: {
        alt: string;
        ctrl: string;
        default: string;
        shift: string;
    };

    analysisHighlightOpacity: 0.8;
    animationType: string; // "default"
    arrowColors: {
        alt: string;
        ctrl: string;
        default: string;
        shift: string;
    };
    aspectRatio: 1;
    autoClaimDraw: boolean;
    autoPromote: boolean;
    autoResize: boolean;
    boardStyle: string; // "green"
    captureKeyStrokes: boolean;
    checkBlinkingSquareColor: string; // "#ff0000"
    coordinates: string; // "inside"
    darkMode: boolean;
    diagramStyle: boolean;
    enabled: boolean;
    fadeSetup: number; // 0
    flipped: boolean;
    highlightLegalMoves: boolean;
    highlightMoves: boolean;
    highlightOpacity: number; // 0.5
    hoverSquareOutline: boolean;
    id: string;
    moveListContextMenuEnabled: boolean;
    moveListDisplayType: string; // "figurine"
    moveMethod: string; // "drag"
    overlayInAnalysisMode: boolean;
    pieceStyle: string; // "neo"
    playSounds: boolean;
    premoveDelay: number; // 200
    premoveHighlightColor: string; // "#f42a32"
    premoveHighlightOpacity: number; // 0.5
    rounded: boolean;
    soundTheme: string; // "default"
    threatSquareColor: string; // "#ff0000"
    threatSquareOpacity: number; // 0.8
    useSharedStyleTag: boolean;
    boardSize: string; // "auto"
    isWhiteOnBottom: boolean;
    showTimestamps: boolean;
    test: boolean;
}

interface IMoveDetail {
    animate: boolean;
    lineDiff: number;
    linesReordered: boolean;
    move: {
        from: string;
        to: string;
        san?: string;
        promotion?: string;
        piece?: string;

        time?: number; // only available when play online

        // only own move
        color?: number; // 1 for white, 2 for black
        lines?: null; // unk
        userGenerated?: boolean;
        userGeneratedDrop?: boolean;

        // ANY_CAPTURE: 5
        // BIG_PAWN: 2 // pawn move 2 steps
        // CAPTURE: 1
        // DROP: 64
        // DROP_OR_PROMOTE: 72
        // EP_CAPTURE: 4
        // KQSIDE_CASTLE: 48
        // KSIDE_CASTLE: 16
        // PROMOTION: 8
        // QSIDE_CASTLE: 32
        flags?: number;
    };
}

interface IGameMarkings {
    addOne(marking: IMarking): string; // return the key, ex: "arrow|e2e4"
    addMany(markings: IMarking[]): void;
    removeOne(key: string): void;
    removeMany(keys: string[]): void;
    getAll(): IMarking[];
    removeAll(): void;
    removeAllWhere(match: any): void;
}

interface IGamePlugin {
    name: string;

    match: {
        condition: { (a: any): boolean };
        handler: { (e: any, t: any): void };
    }[];

    api(e: any): any;
    create(e: any): any;
    destroy(e: any): any;
    destroyAPIMethods(): void;
}

interface IGamePluginManager {
    add(plugin: IGamePlugin): void;
    addMany(plugins: IGamePlugin): void;
    get(): IGamePlugin[];
    has(plugin: IGamePlugin): void;
    remove(pluginName: string): void;
    setCreatePluginContext(e: any): void;
}

interface IChessboardGame {
    // move a piece on the board
    move(move: IMoveDetail): void;

    // change the game mode
    setMode(mode: any): any;

    // emit game events
    emit(event: string, data: any): any;

    // be aware that this will return false if the game hasn't started
    isGameOver(): boolean;

    // is end of theory openings
    // isAtEndOfLine(): boolean;

    eco: {
        get(): GameECO | null;
        update(): Promise<void>;
        _update(): Promise<void>;
    };

    markings: IGameMarkings;

    plugins: IGamePluginManager;

    // get raw history
    getRawLines(): IGameHistory[][];

    getCurrentFullLine(): IGameHistory[];

    getLastMove(): IGameHistory | undefined;

    getContext(): any;

    getOptions(): IGameOptions;

    // get the current FEN
    getFEN(): string;

    // get current turn, 1 is white, 2 is black
    getTurn(): number;

    // get current side, 1 is white, 2 is black
    getPlayingAs(): number;

    // get all legal moves on the board
    getLegalMoves(): IMoveDetail[];

    getNodeIds(): { move: number; line: number };

    isAnimating(): boolean;

    // used for debugging only, calling this will hook all function of the game controller
    debug_hook(): void;

    on: (event: TEventType, fn: (event: IGameEvent) => void) => void;
}

interface IChessComBoardElement extends HTMLElement {
    game: IChessboardGame;
}

const getLAN = (from: string, to: string, promotion?: string) => {
    let lan = from + to;
    if (promotion) {
        lan += promotion;
    }
    return lan as TLANotation;
};

const getEffectType = (effect: TChessboardEffectType): TEffectType => {
    switch (effect) {
        case "Best":
            return "BestMove";
        case "Excellent":
            return "Excellent";
        case "Good":
            return "Good";
        case "Inaccuracy":
            return "Inaccuracy";
        case "Miss":
            return "Miss";
        case "Mistake":
            return "Mistake";
        case "Blunder":
            return "Blunder";
        case "Brilliant":
            return "Brilliant";
        case "Forced":
            return "Forced";
    }
};

const getClassificationMarkings = (function () {
    const markingMap = new Map<
        EClassification,
        { effect: TEffectType; color: string }
    >([
        [
            EClassification.Best,
            { effect: "BestMove", color: "rgb(129, 182, 76)" },
        ],
        [
            EClassification.Excellent,
            { effect: "Excellent", color: "rgb(129, 182, 76)" },
        ],
        [EClassification.Good, { effect: "Good", color: "rgb(149, 183, 118)" }],
        [
            EClassification.Inaccuracy,
            { effect: "Inaccuracy", color: "rgb(247, 198, 49)" },
        ],
        [
            EClassification.Mistake,
            { effect: "Mistake", color: "rgb(255, 164, 89)" },
        ],
        [
            EClassification.Blunder,
            { effect: "Blunder", color: "rgb(250, 65, 45)" },
        ],
        [
            // no color for forced
            EClassification.Forced,
            { effect: "Forced", color: "" },
        ],
        [
            EClassification.Brilliant,
            { effect: "Brilliant", color: "rgb(38, 194, 163)" },
        ],
        [
            EClassification.Great,
            { effect: "GreatFind", color: "rgb(116, 155, 191)" },
        ],
        [EClassification.Book, { effect: "Book", color: "rgb(213, 164, 125)" }],
        [EClassification.Miss, { effect: "Miss", color: "rgb(255, 119, 105)" }],
        [
            EClassification.MissedWin,
            { effect: "MissedWin", color: "rgb(247, 198, 49)" },
        ],
    ]);

    return (
        from: TSquare,
        to: TSquare,
        classification: EClassification
    ): IMarking[] => {
        let m = markingMap.get(classification);
        if (m === undefined) {
            return [];
        }

        const markings: IMarking[] = [];
        markings.push({
            type: "effect",
            tags: ["analysis"],
            persistent: true,
            node: true,
            data: {
                square: to,
                type: m.effect,
            },
        });

        if (m.color !== "") {
            markings.push(
                {
                    type: "highlight",
                    persistent: true,
                    node: true,
                    data: {
                        opacity: 0.5,
                        color: m.color,
                        square: from,
                    },
                },
                {
                    type: "highlight",
                    persistent: true,
                    node: true,
                    data: {
                        opacity: 0.5,
                        color: m.color,
                        square: to,
                    },
                }
            );
        }

        return markings;
    };
})();
import { createApp, defineComponent } from "vue";

import VueTest from "./../../test.vue";

class testPlugin implements IGamePlugin {
    name: string;
    match: { condition: (a: any) => boolean; handler: (e: any, t: any) => void; }[];
    constructor() {
        this.name = "test-plugin";
        this.match = [{
            condition: (a: any) => {
                console.log("plugin condition", a);
                return false;
            },
            handler: (e: any, t:any) => {
            }
        }]
    }
    api(e: any)
    {
        return {};
    }
    create(e: any)
    {
        
    }
    destroy(e: any)
    {
    }
    destroyAPIMethods(): void
    {
    }
    
}

export class ChessComBoard implements IChessboard {
    private readonly board: IChessComBoardElement;
    private readonly game: IChessboardGame;
    private readonly handler: IChessboardHandler;
    private readonly analysis: AnalysisUI;

    constructor(el: HTMLElement, handler: IChessboardHandler) {
        this.board = el as IChessComBoardElement;
        this.game = this.board.game;
        this.handler = handler;

        this.analysis = new AnalysisUI();
        this.analysis.mountEvalbar(this.board.parentElement!);

        this.game.on("Move", (event) => this.onMove(event));
        this.game.on("Load", (event) => this.onLoad(event));
        this.game.on("UpdateOptions", (event) =>
            this.onUpdateBoardOptions(event)
        );
        this.game.on("MoveBackward", (event) => this.onSelectNode(event));
        this.game.on("MoveForward", (event) => this.onSelectNode(event));
        this.game.on("SelectNode", (event) => this.onSelectNode(event));

        // this.game.plugins.add(new testPlugin());

        // // hook the "move-list" plugin to make the sidebar analysis ui
        // // appear when the move list appears
        let pluginsAdd = this.game.plugins.add;
        let _this = this;

        this.game.plugins.add = function (plugin: IGamePlugin) {
            if (plugin.name == "move-list") {
                let pluginCreate = plugin.create;
                plugin.create = function (e: any) {
                    pluginCreate.apply(this, [e]);
                    plugin.match.forEach((match) => {
                        match.condition({ type: "a" });
                    });

                    let element =
                        document.querySelector("wc-simple-move-list") ||
                        document.querySelector("wc-move-list");

                    let scrollerContainerId = element?.getAttribute(
                        "scroll-container-id"
                    )!;

                    let scrollerContainer = document.querySelector(
                        "#" + scrollerContainerId
                    )!.parentElement!;

                    _this.analysis.mountSidebar(scrollerContainer);
                };
            }

            pluginsAdd.apply(this, [plugin]);
        };

        // let pluginsRemove = this.game.plugins.remove;
        // this.game.plugins.remove = function (pluginName: string) {
        //     return pluginsRemove(pluginName);
        // };
    }

    public updateEvaluation(
        moveNumber: number,
        line: Line,
        previousLine?: Line
    ): void {
        // updating the DOM while the board is animating will make it look laggy
        // only update the analysis tools only if we've finished evaluating
        // if (
        //     !this.game.isAnimating() ||
        //     (line.isEvaluationFinished() &&
        //         (previousLine === undefined ||
        //             previousLine.isEvaluationFinished()))
        // ) {
            this.analysis.updateLine(moveNumber, line, previousLine);
        // }
    }

    public getContainer(): HTMLElement {
        return this.board;
    }

    public clearMarkings(): void {
        this.game.markings.removeAllWhere({ tags: ["analysis"] });
    }

    public drawArrow(arrow: IChessboardArrow): void {
        let options = this.game.getOptions();
        let color: string;
        switch (arrow.color) {
            case "Best":
                color = options.arrowColors.alt;
                break;
            case "Excellent":
                color = options.arrowColors.shift;
                break;
            case "Good":
                color = options.arrowColors.ctrl;
                break;
            case "Other":
                color = options.arrowColors.default;
                break;
        }

        this.game.markings.addOne({
            type: "arrow",
            tags: ["analysis"],
            persistent: true,
            node: true,
            data: {
                from: arrow.from,
                to: arrow.to,
                color: color,
                opacity: 0.7,
            },
        });
    }

    public drawEffect(effect: IChessboardEffect): void {
        this.game.markings.addOne({
            type: "effect",
            tags: ["analysis"],
            persistent: true,
            node: true,
            data: {
                square: effect.square,
                type: "Custom" as TEffectType,
                // type: getEffectType(effect.type),
                path: `
    <path id="Shape 1" fill="#ffffff" d="m9 19c-5 0-9-4-9-9 0-5 4-9 9-9 5 0 9 4 9 9 0 5-4 9-9 9z"/>
	<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
	<title>br</title>
	<style>
		.s0 { fill: #f9f9f9;stroke: #403e3d;paint-order:stroke fill markers;stroke-linejoin: round;stroke-width: 12 } 
		.s1 { fill: #d1d0cf } 
		.s2 { fill: #403e3d } 
		.s3 { fill: #f9f9f9 } 
	</style>
	<path id="head" class="s0" d="m82 67.1l2.7 36.2c0 0 0.3 12 16.3 18.7l1 1 45-3 50.3 3.1 1.7-1.1c0 0 15.6-4.7 17-23 0.9-12.1 2-32 2-32 0 0-7.7-5.7-23-6l-6 27h-20l-3-31c0 0-20.7-3.5-31.3-0.1l-3.7 31.1h-20l-6-27c0 0-16.8 1.4-23 6.1z"/>
	<path id="head-shadow" fill-rule="evenodd" class="s1" d="m218 67c0 0-1.1 19.9-2 32-1.4 18.3-17 23-17 23l-1.7 1.1-15.2-0.9c5.3-3.4 13.2-9.9 16.9-15.2 4.5-6.6 9.3-35.4 10.7-43.8 5.5 1.8 8.3 3.8 8.3 3.8z"/>
	<path id="body" class="s0" d="m104 128c0 0 49.8-8.2 92 0l11 90c0 0-76.3-7-114 1z"/>
	<path id="body-shadow" fill-rule="evenodd" class="s1" d="m196 128l11 90c0 0-7.6-0.7-19.1-1.4-1.6-32-9.5-63-22.3-74.4-11.8-10.4-24.7-15.1-33.9-17.1 18-1.2 42.2-1.4 64.3 2.9z"/>
	<g id="white-foot">
		<path id="outter" class="s2" d="m62 270.8c0 0-0.3-16.1 1.2-27.6 2.5-19.5 18-28.1 86.8-28.1v55.9zm176-0.1c0 0 0.3-16-1.2-27.6-2.5-19.4-18.1-28.1-86.8-28.1v56z"/>
		<path id="inner" class="s3" d="m68.6 264.9c0 0-0.3-12.6 1.1-21.7 2.3-15.3 16.7-22.2 80.3-22.2v44.1zm162.7 0c0 0 0.3-12.7-1-21.8-2.3-15.3-16.8-22.1-80.3-22.1v44.1z"/>
	</g>
</svg>`,
            },
        });
    }
    drawClassification(lan: TLANotation, classification: EClassification) {
        this.game.markings.addMany(
            getClassificationMarkings(
                lan.substring(0, 2) as TSquare,
                lan.substring(2, 4) as TSquare,
                classification
            )
        );
    }

    private onMove(event: IGameEvent) {
        let data = event.data as IMoveDetail;

        // check if the game continues at the current line, in analysis mode
        // the user can move into a different line/position
        if (data.lineDiff == 0) {
            let lan = getLAN(data.move.from, data.move.to, data.move.promotion);
            this.handler.onMove(lan);
            return;
        }

        // we don't support multiple lines, just treat it like a new game instead
        let lines = this.game.getCurrentFullLine();
        let lanMoves = lines.map((line) =>
            getLAN(line.from, line.to, line.promotion)
        );
        this.handler.onNewGame(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            lanMoves
        );
    }

    private onLoad(event: IGameEvent) {
        console.log("on load", event.data);
        let lines: IGameHistory[] = event.data.line;
        let lanMoves = lines.map((line) =>
            getLAN(line.from, line.to, line.promotion)
        );

        this.handler.onNewGame(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            lanMoves
        );
    }

    private onUpdateBoardOptions(event: IGameEvent) {
        let options = this.game.getOptions();
        if (event.data.flipped != undefined) {
            this.analysis.setFlipped(event.data.flipped as boolean);
        }
    }

    private onSelectNode(event: IGameEvent) {
        if (event.data.plyDiff != 0) {
            this.handler.onSelectNode(this.game.getNodeIds().move);
        }
    }
}