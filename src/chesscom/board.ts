import { Line } from "../position";
import {
    EClassification,
    IChessboard,
    IChessboardArrow,
    IChessboardEffect,
    IChessboardHandler,
} from "../types/chessboard";
import { AnalysisUI } from "../analysis-ui";
import { TEffectType, IMarking, IBoardElement, IGamePlugin, IGameEvent, IMoveDetail, IGameHistory, IGame } from "@/types/chess.com";
import { Icons } from "@/assets/icons";

function getLAN(from: string, to: string, promotion?: string) {
    let lan = from + to;
    if (promotion) {
        lan += promotion;
    }
    return lan as TLANotation;
};

function getEffectType(effect: TChessboardEffectType): TEffectType {
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

const markingMap = new Map<
    EClassification,
    { effect: TEffectType; color: string }
>([
    [EClassification.Best, { effect: "BestMove", color: "#81b64c" }],
    [EClassification.Excellent, { effect: "Excellent", color: "#81b64c" }],
    [EClassification.Good, { effect: "Good", color: "#95b776" }],
    [EClassification.Inaccuracy, { effect: "Inaccuracy", color: "#f7c631" }],
    [EClassification.Mistake, { effect: "Mistake", color: "#ffa459" }],
    [EClassification.Blunder, { effect: "Blunder", color: "#fa412d" }],
    [EClassification.Forced, { effect: "Forced", color: "" }],
    [EClassification.Brilliant, { effect: "Brilliant", color: "#26c2a3" }],
    [EClassification.Great, { effect: "GreatFind", color: "#749bbf" }],
    [EClassification.Book, { effect: "Book", color: "#d5a47d" }],
    [EClassification.Miss, { effect: "Miss", color: "#ff7769" }],
    [EClassification.MissedWin, { effect: "MissedWin", color: "#f7c631" }],
]);

function getClassificationMarkings(from: TSquare,to: TSquare,classification: EClassification)  {
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

    if (m.color === "") {
        return markings;
    }

    markings.push(
        {
            type: "highlight",
            tags: ["analysis"],
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
            tags: ["analysis"],
            persistent: true,
            node: true,
            data: {
                opacity: 0.5,
                color: m.color,
                square: to,
            },
        }
    );
    return markings;
};

export class ChessComBoard implements IChessboard {
    private readonly board: IBoardElement;
    private readonly game: IGame;
    private readonly handler: IChessboardHandler;
    private readonly analysis: AnalysisUI;

    constructor(el: HTMLElement, handler: IChessboardHandler) {
        this.board = el as IBoardElement;
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

    public updateLine(
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
                type: getEffectType(effect.type),
            },
        });
    }

    public drawClassification(
        lan: TLANotation,
        classification: EClassification
    ) {
        this.game.markings.addMany(
            getClassificationMarkings(
                lan.substring(0, 2) as TSquare,
                lan.substring(2, 4) as TSquare,
                classification
            )
        );
    }

    public drawPromotionSquare(square: TSquare, piece: TPromotionPiece, color: TPieceColor): void {
        this.game.markings.addOne({
            type: "effect",
            tags: ["analysis"],
            persistent: true,
            node: true,
            data: {
                square: square,
                type: "Custom",
                path:
                    `<path fill="#${
                        color === "w" ? "5c5957" : "f9f9f9"
                    }" d="m9 19c-5 0-9-4-9-9 0-5 4-9 9-9 5 0 9 4 9 9 0 5-4 9-9 9z"/>` +
                    Icons.fromPiece(piece, color),
            },
        });    
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
