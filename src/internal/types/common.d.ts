declare type TPiece = "k" | "q" | "r" | "b" | "n" | "p";
declare type TPieceColor = "w" | "b";
declare type TPromotionPiece = "q" | "r" | "b" | "n";

declare type TFile = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
declare type TRank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

declare type TSquare = `${TFile}${TRank}`;
declare type TLANotation =
    | `${TSquare}${TSquare}`
    | `${TSquare}${TSquare}${TPromotionPiece}`;
declare type TSANotation = string;

// absolute evaulation of the board
declare interface IAbsEvaluation {
    score: number;
    isMate: boolean;
}

declare type TChessboardEffectType =
    | "Best"
    | "Excellent"
    | "Good"
    | "Inaccuracy"
    | "Mistake"
    | "Miss"
    | "Blunder"
    | "Brilliant"
    | "Forced";

declare type TChessboardArrowColor = "Best" | "Excellent" | "Good" | "Other";
