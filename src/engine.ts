export interface IEnginePv {
    lan: TLANotation;
    line: TLANotation[];
    from: TSquare;
    to: TSquare;
    promotion?: TPromotionPiece;
    depth: number;
    seldepth: number;
    multipv: number;
    score: number;
    absoluteScore: number;
    isMate: boolean;
    nodes: number;
    nps: number;
}

export interface IEngineHandler {
    onUpdatePv(moveNumber: number, pv: IEnginePv): void
    onBestMoveFound(moveNumber: number, lan: TLANotation): void
}

export const ENGINE_MULTI_PV = 3;

const REGEX_BESTMOVE = /^bestmove (?<bestmove>[a-h][1-8][a-h][1-8][qrbn]?)?/;

const REGEX_PV =
    /^info depth (?<depth>\d+) seldepth (?<seldepth>\d+) multipv (?<multipv>\d+) score (?<scoreType>cp|mate) (?<score>-?\d+) nodes (?<nodes>-?\d+) nps (?<nps>\d+)(?:.*?) pv (?<pv>.+)/;

export class Engine {
    private readonly handler: IEngineHandler;
    private readonly worker: Worker;
    private currentMoveNumber: number = 0;
    private isLoaded: boolean;
    private isReady: boolean;
    private isEvaluating: boolean;
    private isRequestedStop: boolean;
    private readyCallback?: { (): void };
    private bestmoveCallback?: { (): void };

    private options: { [opt: string]: string | number | boolean };
    
    constructor(handler: IEngineHandler) {
        let stockfishJsURL: string;
        let stockfishPathConfig = (window as any).Config.stockfish16_1.lite;

        this.handler = handler;
        this.isLoaded = false;
        this.isReady = false;
        this.isEvaluating = false;
        this.isRequestedStop = false;
        this.readyCallback = undefined;
        this.bestmoveCallback = undefined;

        this.options = {};

        // the multiThreaded NNUE engine needs the browser to support SharedArrayBuffer
        try {
            new SharedArrayBuffer(1024);
            stockfishJsURL = stockfishPathConfig.multiThreaded.loader;
        } catch (e) {
            stockfishJsURL = stockfishPathConfig.singleThreaded.loader;
        }

        this.options["Hash"] = 512;
        this.options["Threads"] = 4;
        this.options["MultiPV"] = ENGINE_MULTI_PV;
        this.options["Ponder"] = true;

        try {
            this.worker = new Worker(stockfishJsURL);
            this.worker.onmessage = (e) => {
                this.ProcessMessage(e);
            };
        } catch (e) {
            alert("Failed to load stockfish");
            throw e;
        }

        this.send("uci");
        this.sendEngineOptions();
    }

    public newGame() {
        this.isReady = false;
        this.send("ucinewgame");
    }

    public go(lanMoves: TLANotation[], depth: number | undefined = undefined) {
        
        let fn = () => {
            this.isEvaluating = true;
            this.currentMoveNumber = lanMoves.length - 1;
            if (this.currentMoveNumber == -1) {
                this.send(`position startpos`);
            } else {
                this.send(`position startpos moves ${lanMoves.join(" ")}`);
            }

            if (depth) {
                this.send(`go depth ${depth}`);
            } else {
                this.send(`go`);
            }
        };

        this.onReady(() => {
            if (this.isEvaluating) this.stop(fn);
            else fn();
        })
    }

    private onReady(callback: { (): void }) {
        if (this.isReady) callback();
        else {
            this.readyCallback = callback;
            this.send("isready");
        }
    }

    private stop(callback: { (): void }) {
        if (this.isEvaluating) {
            this.isRequestedStop = true;
            this.bestmoveCallback = callback;
            this.send("stop");
        } else {
            callback();
        }
    }

    private send(cmd: string): void {
        this.worker.postMessage(cmd);
    }

    private sendEngineOptions(
        options: { [opt: string]: string | number | boolean } | null = null
    ) {
        if (options === null) options = this.options;

        Object.keys(options).forEach((key) => {
            this.send(`setoption name ${key} value ${options![key]}`);
        });
    }

    private ProcessMessage(event: MessageEvent<any>) {
        let line: string =
            event && typeof event === "object" ? event.data : event;

        // console.log("SF: " + line);

        if (line == "uciok") {
            this.isLoaded = true;
            (window as any).toaster.add({
                id: "chess.com",
                duration: 3000,
                icon: "circle-info",
                content: `ChessMint is enabled!`,
            });
        } else if (line === "readyok") {
            this.isReady = true;
            if (this.readyCallback) {
                let copy = this.readyCallback;
                this.readyCallback = undefined;
                copy();
            }
        } else if (this.isEvaluating && line === "Load eval file success: 1") {
            // we have sent the "go" command before stockfish loaded the eval file
            // this.isEvaluating will be stuck at true, this fixes it.
            this.isEvaluating = false;
            this.isRequestedStop = false;
            if (this.bestmoveCallback) {
                let copy = this.bestmoveCallback;
                this.bestmoveCallback = undefined;
                copy();
            }
        } else {
            let match = REGEX_PV.exec(line);

            if (match && match.groups) {
                if (!this.isRequestedStop) {
                    const line = match.groups["pv"].split(" ") as TLANotation[];
                    const score = parseInt(match.groups["score"]);
                    const absoluteScore =
                        this.currentMoveNumber % 2 == 0 ? -score : score;

                    const promotion =
                        line[0].length == 5
                            ? (line[0].substring(4, 5) as TPromotionPiece)
                            : undefined;
                    
                    let pv: IEnginePv = {
                        lan: line[0],
                        line: line,
                        from: line[0].substring(0, 2) as TSquare,
                        to: line[0].substring(2, 4) as TSquare,
                        promotion: promotion,
                        depth: parseInt(match.groups["depth"]),
                        seldepth: parseInt(match.groups["seldepth"]),
                        multipv: parseInt(match.groups["multipv"]),
                        score: score,
                        absoluteScore: absoluteScore,
                        isMate: match.groups["scoreType"] == "mate",
                        nodes: parseInt(match.groups["nodes"]),
                        nps: parseInt(match.groups["nps"]),
                    };
                    this.handler.onUpdatePv(this.currentMoveNumber, pv);
                }
            } else if ((match = REGEX_BESTMOVE.exec(line))) {
                this.isEvaluating = false;
                if (this.bestmoveCallback) {
                    let copy = this.bestmoveCallback;
                    this.bestmoveCallback = undefined;
                    copy();
                }

                if (!this.isRequestedStop && match[1] !== undefined) {
                    this.handler.onBestMoveFound(
                        this.currentMoveNumber,
                        match[1] as TLANotation
                    );
                }

                this.isRequestedStop = false;
            }
        }
    }
}
