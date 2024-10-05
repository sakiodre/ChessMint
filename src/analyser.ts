import { options } from "./options";
import { Line } from "./position";
import { EClassification, IChessboard } from "./types/chessboard";


export class Analyser {
    private readonly board: IChessboard;

    constructor(board: IChessboard) {
        this.board = board;
    }

    public updateLine(
        moveNumber: number,
        currentLine: Line,
        isSacrifice: boolean,
        previousLine?: Line
    ) {
        this.board.clearMarkings();

        if (options.showArrows) {
            // draw arrows, in reverse so best move appears on top
            for (let idx = currentLine.pvs.length - 1; idx >= 0; idx--) {
                const pv = currentLine.pvs[idx];
                if (pv.depth < currentLine.pvs[0].depth) continue;

                this.board.drawArrow({
                    from: pv.from,
                    to: pv.to,
                    color: idx == 0 ? "Best" : "Excellent",
                });

                if (pv.promotion) {
                    this.board.drawPromotionSquare(
                        pv.to,
                        pv.promotion,
                        currentLine.turn
                    );
                }
            }
        }

        const evaluation = currentLine.getEvaluation();

        // move classification
        if (previousLine) {
            let classification: EClassification;
            const previousClassification = previousLine.getClassification();
            
            if (currentLine.isInTheory) {
                classification = EClassification.Book;
            }
            else if (previousLine.legalMoves.length == 1) {
                classification = EClassification.Forced;
            }
            else if (currentLine.lan == previousLine.getBestMove()) {
                classification = EClassification.Best;

            } else {
                const previousEvaluation = previousLine.getEvaluation();
                classification = classifyEvals(
                    previousLine.turn,
                    previousEvaluation,
                    evaluation,
                    false
                );
            }

            if (isSacrifice && classification == EClassification.Best) {
                classification = EClassification.Brilliant;

            } else if (previousLine.isMate(previousLine.turn) && !currentLine.isMate(previousLine.turn)) {
                classification = EClassification.MissedWin;

            } else if (
                previousClassification &&
                (previousClassification == EClassification.Blunder &&
                    classification == EClassification.Blunder) ||
                (previousClassification == EClassification.Mistake &&
                    classification == EClassification.Mistake)
            ) {
                classification = EClassification.Miss;
            }

            currentLine.setClassification(classification);

            if (options.showClassification) {
                this.board.drawClassification(currentLine.lan, classification);
            }
        }

        this.board.updateLine(moveNumber, currentLine, previousLine);
    }
}

// taken from minified chess.com's source code, so don't expect the code below to make any sense
// go to /play/computer and search for "classifyEvals" in the source

function classifyEvals(
    color: TPieceColor,
    previousEvaluation: IAbsEvaluation,
    evaluation: IAbsEvaluation,
    isForced: boolean
): EClassification {

    let classification = classifyPosition(
        color,
        previousEvaluation,
        evaluation,
        false,
        isForced
    );

    return classification;
}

function classifyPosition(
    color: TPieceColor,
    previousEvaluation: IAbsEvaluation,
    evaluation: IAbsEvaluation,
    unknownBool: boolean,
    isForced: boolean
): EClassification {
    let isMateSlower = false;
    let scoreMultiplication = "b" === color ? -1 : 1;
    let previousScore = previousEvaluation.score * scoreMultiplication / 100;
    let currentScore = evaluation.score * scoreMultiplication / 100;
    let difference = 0;
    let classification = 5;
    let d = 0;

    if (previousEvaluation.isMate) {
        if (previousEvaluation.score === 0) {
            previousScore = previousScore > 0 ? 1e3 : -1e3;
        } else {
            previousScore =
                (1e3 - 10 * Math.abs(previousEvaluation.score)) *
                (previousEvaluation.score > 0 ? 1 : -1) *
                scoreMultiplication;
        }
    }

    if (evaluation.isMate) {
        if (evaluation.score === 0) {
            currentScore = currentScore > 0 ? 1e3 : -1e3;
        } else {
            currentScore =
                (1e3 - 10 * Math.abs(evaluation.score)) *
                (evaluation.score > 0 ? 1 : -1) *
                scoreMultiplication;
        }
    }

    if (previousScore < currentScore) {
        previousScore = currentScore;
    }

    if (currentScore >= 10) {
        classification = EClassification.Excellent;
    } else if (currentScore >= 7) {
        classification = EClassification.Good;
    } else if (currentScore >= 6) {
        classification = EClassification.Inaccuracy;
    } else if (currentScore >= 5) {
        classification = EClassification.Mistake;
    } else if (currentScore <= -25 && previousScore >= -5) {
        d = EClassification.Blunder;
    } else if (currentScore <= -25 && previousScore >= -10) {
        d = EClassification.Mistake;
    } else if (currentScore <= -20 && previousScore >= -15) {
        d = EClassification.Inaccuracy;
    }

    difference = Math.abs(
        Math.round((previousScore - currentScore) * 100) / 100
    );

    if (
        unknownBool &&
        previousEvaluation.isMate &&
        evaluation.isMate &&
        previousEvaluation.score !== evaluation.score
    ) {
        isMateSlower =
            previousEvaluation.score * scoreMultiplication <
            evaluation.score * scoreMultiplication;
    }

    let grade = moveGrade(difference, currentScore);
    let e_class: EClassification = 5 - grade.gradeIndex;

    if (e_class > classification) {
        e_class = classification;
    } else if (e_class < d) {
        e_class = d;
    }

    if (isMateSlower) {
        e_class = EClassification.Good;
    }

    return e_class;
}

function moveGrade(difference: number, currentScore: number) {
    var n,
        i,
        r,
        o,
        l,
        c,
        u,
        d,
        h,
        higherRange,
        sdiff,
        lowerRange,
        previousSdiff,
        defaultGrade = 100,
        gradeMap: any = {
            blunder: [0, 40],
            mistake: [40, 60],
            inaccuracy: [60, 80],
            good: [80, 95],
            excellent: [95, 98],
            best: [98, 100],
        },
        w = {
            numerator: 4.9,
            denominator: 0.1215,
        };
    if (difference <= 0)
        return {
            letter: "best",
            number: defaultGrade,
            gradeIndex: 5,
        };

    let maxDifference = 1e3;
    difference = Math.min(maxDifference, difference);
    let sdiffCutoffs = generateSdiffCutoffs(currentScore);
    for (n = 0; n < sdiffCutoffs.length; n += 1) {
        i = sdiffCutoffs[n];
        if (!(difference < i)) {
            r = n;
            break;
        }
    }

    if (r === undefined) {
        r = 0;
    }

    o = ["blunder", "mistake", "inaccuracy", "good", "excellent", "best"][r];
    if ("blunder" === o) {
        sdiff = sdiffCutoffs[r];
        higherRange = gradeMap.blunder[1];
        d = (maxDifference / (maxDifference - sdiff)) * (difference - sdiff);
        d = Math.min(maxDifference, d);
        l = higherRange - (w.numerator * d) / (1 + w.denominator * d);
    } else {
        lowerRange = gradeMap[o][0];
        higherRange = gradeMap[o][1];
        previousSdiff = sdiffCutoffs[r - 1];
        sdiff = sdiffCutoffs[r];
        u = sdiff - previousSdiff;
        h = difference - previousSdiff;
        c = higherRange - lowerRange;
        l = lowerRange + (h / u) * c;
    }
    return {
        letter: o,
        number: (l = Math.max(0, (l = Math.min(defaultGrade, l)))),
        gradeIndex: r,
    };
}

function generateSdiffCutoffs(value: number) {
    return [
        0.001776052 * Math.pow((value = Math.min(20, Math.abs(value))), 3) +
            -0.018218136 * Math.pow(value, 2) +
            0.303967449 * value +
            2,
        0.001304692 * Math.pow(value, 3) +
            -0.011609068 * Math.pow(value, 2) +
            0.205317058 * value +
            1.1,
        4461266e-10 * Math.pow(value, 3) +
            0.0041181833 * Math.pow(value, 2) +
            0.0141864828 * value +
            0.5,
        2172109e-10 * Math.pow(value, 3) +
            -0.0010745878 * Math.pow(value, 2) +
            0.0295840731 * value +
            0.1,
        0,
    ];
}

// function determineScenarios(e: any) {
//     (("white" === e.color &&
//         evaluation.score <= -2.5 &&
//         previousEvaluation.score >= 2.5) ||
//         ("black" === e.color &&
//             evaluation.score >= 2.5 &&
//             previousEvaluation.score <= -2.5)) &&
//         (e.scenarios.winningToLosing = !0);
//     previousEvaluation.isMate &&
//         "number" != typeof evaluation.isMate &&
//         (e.scenarios.missedMate = !0);
//     "number" == typeof previousEvaluation.isMate &&
//         (("white" === e.color &&
//             evaluation.isMate > 0 &&
//             evaluation.isMate > previousEvaluation.isMate) ||
//             ("black" === e.color &&
//                 evaluation.isMate < 0 &&
//                 evaluation.isMate < previousEvaluation.isMate)) &&
//         (e.scenarios.fasterMate = !0);
// }
