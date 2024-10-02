type TPiece = "k" | "q" | "r" | "b" | "n" | "p";
type TPieceColor = "w" | "b";
type TPromotionPiece = "q" | "r" | "b" | "n";

type TFile = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
type TRank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

type TSquare = `${TFile}${TRank}`;
type TLANotation = `${TSquare}${TSquare}` | `${TSquare}${TSquare}${TPromotionPiece}`;
type TSANotation = string

// absolute evaulation of the board
interface IAbsEvaluation {
    score: number;
    isMate: boolean;
}

type TChessboardEffectType =
    | "Best"
    | "Excellent"
    | "Good"
    | "Inaccuracy"
    | "Mistake"
    | "Miss"
    | "Blunder"
    | "Brilliant"
    | "Forced";

type TChessboardArrowColor = "Best" | "Excellent" | "Good" | "Other";
