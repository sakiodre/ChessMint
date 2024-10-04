export type TEventType =
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

export interface IGameEvent {
    data: any;
    type: TEventType;
}

export type TEffectType =
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

export type TMarkingType = "arrow" | "effect" | "highlight";

export interface IMarking {
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

export interface IGameHistory {
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
export interface IGameECO {
    ml: string; // moves by theory, in full notation, ex: "e2e4 c7c5 g1f3 a7a6 c2c3 b7b5"
    m: string; // moves by theory, in san, ex: "1.e4 c5 2.Nf3 a6 3.c3 b5"
    n: string; // theory name, ex: "Sicilian Defense: O'Kelly, Venice, Ljubojević Line"
    u: string; // theory name, ex: "Sicilian-Defense-OKelly-Venice-Ljubojevic-Line"
}

export interface IGameOptions {
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

export interface IMoveDetail {
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

export interface IGameMarkings {
    addOne(marking: IMarking): string; // return the key, ex: "arrow|e2e4"
    addMany(markings: IMarking[]): void;
    removeOne(key: string): void;
    removeMany(keys: string[]): void;
    getAll(): IMarking[];
    removeAll(): void;
    removeAllWhere(match: any): void;
}

export interface IGamePlugin {
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

export interface IGamePluginManager {
    add(plugin: IGamePlugin): void;
    addMany(plugins: IGamePlugin): void;
    get(): IGamePlugin[];
    has(plugin: IGamePlugin): void;
    remove(pluginName: string): void;
    setCreatePluginContext(e: any): void;
}

export interface IGame {
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
        get(): IGameECO | null;
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

export interface IBoardElement extends HTMLElement {
    game: IGame;
}
