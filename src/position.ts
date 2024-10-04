import { Chess } from "chess.js";
import { ENGINE_MULTI_PV, IEnginePv } from "./engine";
import { Analyser } from "./analyser";
import { EClassification, IChessboard } from "./types/chessboard";
import eco from "./assets/ecotable.json";

const ecoTable = eco as string[];
export interface IPrincipalVariation extends IEnginePv {
    san: TSANotation;
    lineSan: TSANotation[];
}

let convertEnginePv = (fen: string, pv: IEnginePv): IPrincipalVariation => {
    
    const chess = new Chess();
    chess.load(fen);

    const lineSan = pv.line.map((san) => {
        const move = chess.move(san)
        return move.san;
    })

    return {
        ...pv,
        san: lineSan[0],
        lineSan: lineSan,
    };
};

export class Line {
    public readonly pvs: IPrincipalVariation[];
    public readonly isInTheory: boolean; // is the game still in theory openings
    public readonly fen: string;
    public readonly lan: TLANotation;
    public readonly san: TSANotation;
    public readonly side: "w" | "b"; // the side that played the move 'lan'/'san'
    public readonly turn: "w" | "b"; // the next turn color
    public readonly legalMoves: TSANotation[];
    private classification?: EClassification;
    private accuracy: number = 100;
    private winChance: number = 0; // from -1 to 1; -1 is 100% win chance for black and otherwise
    private isBestmoveFound: boolean;

    constructor(
        fen: string,
        lan: TLANotation,
        san: TSANotation,
        legalMoves: TSANotation[]
    ) {
        const shortFen = fen.split(" ").slice(0, 3).join(" ");
        this.pvs = [];
        this.isInTheory = ecoTable.find((f) => f == shortFen) !== undefined;
        this.fen = fen;
        this.lan = lan;
        this.san = san;
        this.legalMoves = legalMoves;

        if (this.fen.split(" ")[1] == "w") {
            this.turn = "w";
            this.side = "b";
        } else {
            this.turn = "b";
            this.side = "w";
        }

        this.isBestmoveFound = false;
    }

    // return true if a purge happened
    private sortPvs(): boolean {
        if (this.pvs.length == 0) {
            return false;
        }

        // sort the top move list to bring the best moves on top (index 0)
        this.pvs.sort(function (a, b) {
            if (!b.isMate) {
                // this move is mate and the other is not
                if (a.isMate) {
                    // a negative mate value is a losing move
                    return a.score < 0 ? 1 : -1;
                }

                // both moves has no mate, compare the depth first than centipawn
                if (a.depth === b.depth) {
                    if (a.score === b.score) return 0;
                    return (a.score as number) > (b.score as number) ? -1 : 1;
                }

                return a.depth > b.depth ? -1 : 1;
            } else {
                // both this move and other move is mate
                if (a.isMate) {
                    // both losing move, which takes more moves is better
                    // both winning move, which takes less move is better
                    if (
                        (a.score < 0 && b.score < 0) ||
                        (a.score > 0 && b.score > 0)
                    ) {
                        return a.score < b.score ? 1 : -1;
                    }

                    // comparing a losing move with a winning move, positive mate score is winning
                    return a.score > b.score ? -1 : 1;
                }

                return b.score < 0 ? 1 : -1;
            }
        });

        // purge pv that has depth lower than best move depth - 2
        const bestMoveDepth = this.pvs[0].depth;
        let numPvAtBestMoveDepth = 1;
        let purgeIndex = -1;

        for (let idx = 1; idx < this.pvs.length; idx++) {
            if (this.pvs[idx].depth == bestMoveDepth){
                numPvAtBestMoveDepth++;
                if (numPvAtBestMoveDepth == ENGINE_MULTI_PV || numPvAtBestMoveDepth == this.legalMoves.length) {
                    purgeIndex = idx + 1;
                    break;
                }
            }
            else if (this.pvs[idx].depth <= bestMoveDepth - 2) {
                purgeIndex = idx;
                break;
            }
        }

        if (purgeIndex != -1) {
            this.pvs.splice(purgeIndex);
            // console.log("purge", this.pvs.map((e) => e.depth));
            return true;
        }

        return false;
    }

    // return true if we should update analyser
    public updatePv(pv: IEnginePv, previousLine?: Line): boolean {
        let index = this.pvs.findIndex((otherPv) => otherPv.lan == pv.lan);
        if (index != -1) {
            this.pvs[index] = convertEnginePv(this.fen, pv);
        } else {
            this.pvs.push(convertEnginePv(this.fen, pv));
        }

        const isPurged = this.sortPvs();
        this.updateWinChance();

        if (previousLine) {
            this.updateAccuracy(previousLine.getWinChance(previousLine.turn));
        }

        return isPurged;
    }

    public updateBestMove(lan: TLANotation) {
        let index = this.pvs.findIndex((pv) => pv.lan == lan);
        if (index != -1) {
            if (index > 0) {
                this.pvs.unshift(this.pvs.splice(index, 1)[0]);
            }

            let bestMoveDepth = this.pvs[0].depth;

            this.isBestmoveFound = true;
        } else {
            console.error("could not find best move in pv list");
        }
    }

    public setClassification(classification: EClassification) {
        this.classification = classification;
    }

    public getClassification() {
        return this.classification;
    }

    public getAccuracy() {
        return this.accuracy;
    }

    public isGameOver() {
        return this.legalMoves.length == 0
    }

    public findPv(lan: TLANotation) {
        return this.pvs.find((pv) => {
            return pv.lan == lan;
        });
    }

    // get absolute evaluation of the board
    public getEvaluation(): IAbsEvaluation {
        if (this.pvs.length == 0) return { score: 0, isMate: false };
        return { score: this.pvs[0].absoluteScore, isMate: this.pvs[0].isMate };
    }

    public getBestMove(): TLANotation {
        if (this.pvs.length == 0) return "a1a1";
        return this.pvs[0].lan;
    }

    public getBestPv() {
        return this.pvs.length > 0 ? this.pvs[0] : undefined;
    }
    // https://lichess.org/page/accuracy
    private updateWinChance() {
        if (this.pvs.length == 0) {
            this.winChance = 0;
            return;
        }

        // if (this.pvs[0].isMate) {
        //     this.winChance = this.pvs[0].absoluteScore < 0 ? -1 : 1;
        //     return;
        // }

        let centipawns = this.pvs[0].absoluteScore;
        this.winChance = 2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1;
    }

    private updateAccuracy(previousWinChance: number) {
        let currentWinChance = this.getWinChance(this.side);
        this.accuracy =
            103.1668 *
                Math.exp(-0.04354 * (previousWinChance - currentWinChance)) -
            3.1669;

        if (this.accuracy > 100) {
            this.accuracy = 100;
        } else if (this.accuracy < 0) {
            this.accuracy = 0;
        }
    }

    // return 0 to 100
    public getWinChance(forColor: TPieceColor = this.side): number {
        if (forColor == "w") {
            return ((this.winChance + 1) / 2) * 100;
        }
        return ((this.winChance - 1) / 2) * -100;
    }

    public isMate(forColor?: TPieceColor): boolean {
        if (this.pvs.length == 0) return false;
        if (!this.pvs[0].isMate) return false;

        if (forColor === undefined) {
            return true;
        } else if (forColor == "b") {
            return this.pvs[0].absoluteScore < 0;
        } else if (forColor == "w") {
            return this.pvs[0].absoluteScore > 0;
        }

        return false;
    }

    public isEvaluationFinished(): boolean {
        return this.isBestmoveFound;
    }

    public hasNoEvaluation(): boolean {
        return this.pvs.length == 0;
    }
}

export class Position {
    private readonly chess = new Chess();
    private readonly board: IChessboard;
    private readonly analyser: Analyser;
    private readonly startLine: Line;
    private currentNode: number = -1;

    private lines: Line[] = [];
    private startFen: string = "";

    constructor(board: IChessboard) {
        this.board = board;
        this.analyser = new Analyser(this.board);
        this.startLine = new Line(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "a1a1",
            "",
            this.chess.moves()
        );
        this.newGame();
    }

    public newGame() {
        this.currentNode = -1;
        this.lines = [];
        this.startFen =
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        this.chess.reset();
    }

    public move(lan: TLANotation) {
        const m = this.chess.move(lan);
        const line = new Line(m.after, lan, m.san, this.chess.moves());
        this.lines.push(line);
        this.currentNode = this.lines.length - 1;
        return line;
    }

    public getLine(moveNumber: number) {
        if (moveNumber < 0) {
            return this.startLine;
        }

        if (moveNumber >= this.lines.length) {
            console.trace(`could not get line at move number ${moveNumber}`);
            return undefined;
        }
        return this.lines[moveNumber];
    }

    public getCurrentLine() {
        return this.lines.length == 0
            ? this.startLine
            : this.lines[this.lines.length - 1];
    }

    public getLastLine() {
        return this.lines.length == 0
            ? undefined
            : this.lines[this.lines.length - 2];
    }

    public getCurrentNode() {
        return this.currentNode;
    }

    public getCurrentMoveNumber(): number {
        return this.lines.length - 1;
    }

    public getLanMoves(): TLANotation[] {
        return this.lines.map((line) => line.lan);
    }

    public getLanMovesAtNode(moveNumber: number): TLANotation[] {
        if (moveNumber < 0) {
            return [];
        }
        return this.lines.slice(0, moveNumber + 1).map((line) => line.lan);
    }

    public onUpdatePv(moveNumber: number, pv: IEnginePv) {
        let line = this.getLine(moveNumber);
        if (line) {
            let previousLine;
            if (moveNumber != -1) {
                previousLine = this.getLine(moveNumber - 1);
                if (previousLine?.hasNoEvaluation()) {
                    previousLine = undefined;
                }
            }
            
            if (line.updatePv(pv, previousLine)) {
                this.updateAnalyser(moveNumber);
            }
        }
    }

    public onBestMoveFound(moveNumber: number, lan: TLANotation) {
        let line = this.getLine(moveNumber);
        if (line) {
            line.updateBestMove(lan);
            this.updateAnalyser(moveNumber);
        }
    }

    public onSelectNode(moveNumber: number): Line | undefined {
        let line = this.getLine(moveNumber);
        if (line) {
            this.currentNode = moveNumber;
            this.updateAnalyser(moveNumber);
            return line;
        }
    }
    
    private updateAnalyser(moveNumber: number) {
        // we are updating the previous line of this node
        // for example, we are at move number 5, and the evaluation is done
        // but we didn't have the evaluation for move number 4, so we requested it
        // so now we're at moveNumber 4, but the actual move we need to update it 5
        if (moveNumber == this.currentNode - 1) {
            moveNumber += 1;
        }

        let line = this.getLine(moveNumber);
        if (line && !line.hasNoEvaluation()) {
            let previousLine;
            if (moveNumber != -1) {
                previousLine = this.getLine(moveNumber - 1);
                if (previousLine?.hasNoEvaluation()) {
                    previousLine = undefined;
                }
            }

            this.analyser.updateLine(moveNumber, line, false, previousLine);
        }
    }
}
