import { Line } from "../position";

export enum EClassification {
    Best,
    Excellent,
    Good,
    Inaccuracy,
    Mistake,
    Blunder,
    Forced,
    Book,
    Brilliant,
    Great,
    Miss,
    MissedWin,
}

export interface IChessboardArrow {
    from: TSquare;
    to: TSquare;
    color: TChessboardArrowColor;
}

export interface IChessboardEffect {
    square: TSquare;
    type: TChessboardEffectType;
}

export interface IChessboardHandler {
    onMove(lan: TLANotation): void;
    onNewGame(fen: string, lanMoves: TLANotation[]): void;
    onSelectNode(moveNumber: number): void;
}

export interface IChessboard {
    clearMarkings(): void;
    drawArrow(arrow: IChessboardArrow): void;
    drawEffect(effect: IChessboardEffect): void;
    drawClassification(lan: TLANotation, classification: EClassification): void;
    getContainer(): HTMLElement;
    updateLine(moveNumber: number, line: Line, previousLine?: Line): void;
}
