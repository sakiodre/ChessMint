import { EClassification } from "@/types/chessboard";
const alternative = require("./svg/alternative.svg") as string;
const best = require("./svg/best.svg") as string;
const blunder = require("./svg/blunder.svg") as string;
const book = require("./svg/book.svg") as string;
const brilliant = require("./svg/brilliant.svg") as string;
const checkmateBlack = require("./svg/checkmateBlack.svg") as string;
const checkmateWhite = require("./svg/checkmateWhite.svg") as string;
const correct = require("./svg/correct.svg") as string;
const critical = require("./svg/critical.svg") as string;
const defeatBlack = require("./svg/defeatBlack.svg") as string;
const defeatWhite = require("./svg/defeatWhite.svg") as string;
const drawBlack = require("./svg/drawBlack.svg") as string;
const drawWhite = require("./svg/drawWhite.svg") as string;
const excellent = require("./svg/excellent.svg") as string;
const fastWin = require("./svg/fastWin.svg") as string;
const freePiece = require("./svg/freePiece.svg") as string;
const verticalSlider = require("./svg/verticalSlider.svg") as string;
const greatFind = require("./svg/greatFind.svg") as string;
const forced = require("./svg/forced.svg") as string;
const good = require("./svg/good.svg") as string;
const inaccuracy = require("./svg/inaccuracy.svg") as string;
const miss = require("./svg/miss.svg") as string;
const mate = require("./svg/mate.svg") as string;
const missedWin = require("./svg/missedWin.svg") as string;
const mistake = require("./svg/mistake.svg") as string;
const resignBlack = require("./svg/resignBlack.svg") as string;
const resignWhite = require("./svg/resignWhite.svg") as string;
const sharp = require("./svg/sharp.svg") as string;
const takeBack = require("./svg/takeBack.svg") as string;
const threat = require("./svg/threat.svg") as string;
const clockBlack = require("./svg/clockBlack.svg") as string;
const clockWhite = require("./svg/clockWhite.svg") as string;
const counterClockwiseArrow =
    require("./svg/counterClockwiseArrow.svg") as string;
const winner = require("./svg/winner.svg") as string;
const winnerWhite = require("./svg/winnerWhite.svg") as string;
const interesting = require("./svg/interesting.svg") as string;
const warning = require("./svg/warning.svg") as string;
const equal = require("./svg/equal.svg") as string;

const wk = require("./svg/pieces/wk.svg") as string;
const wq = require("./svg/pieces/wq.svg") as string;
const wr = require("./svg/pieces/wr.svg") as string;
const wb = require("./svg/pieces/wb.svg") as string;
const wn = require("./svg/pieces/wn.svg") as string;
const wp = require("./svg/pieces/wp.svg") as string;

const bk = require("./svg/pieces/bk.svg") as string;
const bq = require("./svg/pieces/bq.svg") as string;
const br = require("./svg/pieces/br.svg") as string;
const bb = require("./svg/pieces/bb.svg") as string;
const bn = require("./svg/pieces/bn.svg") as string;
const bp = require("./svg/pieces/bp.svg") as string;

export namespace Icons {
    const pieceMap = new Map<string, string>([
        ["wk", wk],
        ["wq", wq],
        ["wr", wr],
        ["wb", wb],
        ["wn", wn],
        ["wp", wp],
        ["bk", bk],
        ["bq", bq],
        ["br", br],
        ["bb", bb],
        ["bn", bn],
        ["bp", bp],
    ]);

    const classificationMap = new Map<EClassification, string>([
        [EClassification.Best, best],
        [EClassification.Excellent, excellent],
        [EClassification.Good, good],
        [EClassification.Inaccuracy, inaccuracy],
        [EClassification.Mistake, mistake],
        [EClassification.Blunder, blunder],
        [EClassification.Forced, forced],
        [EClassification.Brilliant, brilliant],
        [EClassification.Great, greatFind],
        [EClassification.Book, book],
        [EClassification.Miss, miss],
        [EClassification.MissedWin, missedWin],
    ]);

    export function fromClassification(
        classification: EClassification,
        width: number | string,
        height: number | string
    ) {
        return `<svg width="${width}" height="${height}" viewBox="0 0 18 19">${
            classificationMap.get(classification) ?? ""
        }</svg>`;
    };

    export function fromPiece(piece: TPiece, color: TPieceColor) {
        return pieceMap.get(color + piece) ?? "";
    }
}
