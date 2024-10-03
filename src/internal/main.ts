import { Engine, IEnginePv } from './engine';
import { Position } from './position';
import { ChessComBoard } from './chesscom/interface';
import { IChessboard } from './types/chessboard';

class BetterMint {
    private readonly board: IChessboard;
    private readonly engine: Engine;
    private readonly position: Position;

    private readonly depth: number = 18;

    constructor(chessBoard: HTMLElement) {
        this.board = new ChessComBoard(chessBoard, this);
        this.position = new Position(this.board);
        this.engine = new Engine(this);
    }

    // if we reloaded the page and the current line is analysed but not the previous line
    // we need to analyse it in order to classify moves and accuracy,.. etc
    // also happens when premoving, causing the previous move to be skipped
    private evaluatePreviousLineIfNeeded(currentMoveNumber: number) {
        if (currentMoveNumber == -1) {
            return;
        }
        let lastLine = this.position.getLine(currentMoveNumber - 1);

        if (lastLine && !lastLine.isEvaluationFinished()) {
            this.engine.go(
                this.position.getLanMovesAtNode(currentMoveNumber - 1),
                this.depth
            );
        }
    }

    public onMove(lan: TLANotation) {
        this.position.move(lan);
        this.engine.go(this.position.getLanMoves(), this.depth);
    }

    public onSelectNode(moveNumber: number) {
        let line = this.position.onSelectNode(moveNumber);
        if (line) {
            if (!line.isEvaluationFinished()) {
                this.engine.go(
                    this.position.getLanMovesAtNode(moveNumber),
                    this.depth
                );
            } else {
                this.evaluatePreviousLineIfNeeded(moveNumber);
            }
        }
    }

    public onNewGame(fen: string, lanMoves: TLANotation[]) {
        // same position, don't change anything
        if (this.position.getLanMoves().join(" ") == lanMoves.join(" ")) {
            return;
        }
        
        this.position.newGame();
        this.engine.newGame();

        lanMoves.forEach((lan) => {
            this.position.move(lan);
        });

        this.engine.go(this.position.getLanMoves(), this.depth);
    }

    public onUpdatePv(moveNumber: number, pv: IEnginePv) {
        this.position.onUpdatePv(moveNumber, pv);
    }

    public onBestMoveFound(moveNumber: number, lan: TLANotation) {
        this.position.onBestMoveFound(moveNumber, lan);

        if (moveNumber != -1 && moveNumber == this.position.getCurrentNode()) {
            this.evaluatePreviousLineIfNeeded(moveNumber);
        }
    }
}

function Initialize(chessBoard: HTMLElement) {
    new BetterMint(chessBoard);
}

const observer = new MutationObserver(async function (mutations) {
    mutations.forEach(async function (mutation) {
        mutation.addedNodes.forEach(async function (node) {
            if (node.nodeType === Node.ELEMENT_NODE){
                const el = node as HTMLElement;
                if (el.tagName == "WC-CHESS-BOARD" || el.tagName == "CHESS-BOARD"){
                    if (Object.hasOwn(el, "game")) {
                        Initialize(el);
                        observer.disconnect();
                    }
                }
            }
        })
    })
});

observer.observe(document, {
    childList: true,
    subtree: true
});

// customElements
//     .whenDefined("wc-simple-move-list")
//     .then(function (ctor: CustomElementConstructor) {
//         // alert("wc-simple-move-list");
//         console.log(ctor);

//         let boardReady = ctor.prototype.boardReady as Function;
//         ctor.prototype.boardReady = function() {
//             boardReady.apply(this, arguments);
//         };
//     });
// customElements.whenDefined("evaluation-bar").then(function (ctor: CustomElementConstructor)
// {
//     alert("evaluation-bar");
//     console.log(ctor);
// });


// this make the move list show our annotations
customElements
    .whenDefined("wc-mode-swap-move-list")
    .then(function (ctor: CustomElementConstructor) {
        ctor.prototype.getMoveListType = function () {
            return "wc-move-list";
        };
    });
