import { Icons } from "../assets/icons";
import { IPricipalVariation as IPrincipalVariation, Line } from "../position";
import { EClassification } from "../types/chessboard";
import { evaluationToString } from "../utils/utils";

const EVALUATION_LINES_MAX = 3;

class BaseUIComponent {
    public readonly root: HTMLElement;
    private isVisible: boolean = true;

    constructor(tagName: string) {
        this.root = document.createElement(tagName);
    }

    public setVisible(isVisible: boolean) { 
        if (this.isVisible != isVisible) {
            this.isVisible = isVisible;
            this.root.style.display = isVisible ? "" : "none";
        }
    }
}

export class EvaluationBar extends BaseUIComponent {
    private readonly wrapper: HTMLDivElement;
    private readonly bar: HTMLDivElement;
    private readonly scoreAbbreviated: HTMLSpanElement;
    private readonly score: HTMLSpanElement;
    private readonly fill: HTMLDivElement;
    private readonly black: HTMLDivElement;
    private readonly draw: HTMLDivElement;
    private readonly white: HTMLDivElement;
    private readonly critical: HTMLSpanElement;

    constructor(parent: HTMLElement) {
        super("div");
        this.root.classList.add("board-layout-evaluation");

        this.wrapper = document.createElement("div");
        this.wrapper.style.flex = "1 1 auto";

        this.bar = document.createElement("div");
        this.bar.classList.add(
            "evaluation-bar-bar",
            "evaluation-bar-wide-eval-bar"
        );

        this.scoreAbbreviated = document.createElement("span");
        this.scoreAbbreviated.classList.add(
            "evaluation-bar-scoreAbbreviated",
            "evaluation-bar-dark"
        );
        this.scoreAbbreviated.textContent = "0.0";

        this.score = document.createElement("span");
        this.score.classList.add("evaluation-bar-score", "evaluation-bar-dark");
        this.score.textContent = "+0.0";

        this.fill = document.createElement("div");
        this.fill.classList.add("evaluation-bar-fill");

        this.black = document.createElement("div");
        this.black.classList.add(
            "evaluation-bar-color",
            "evaluation-bar-black"
        );

        this.draw = document.createElement("div");
        this.draw.classList.add("evaluation-bar-color", "evaluation-bar-draw");

        this.white = document.createElement("div");
        this.white.style.transform = "translate3d(0px, 50%, 0px)";
        this.white.classList.add(
            "evaluation-bar-color",
            "evaluation-bar-white"
        );

        this.critical = document.createElement("span");
        this.critical.classList.add("evaluation-bar-critical");

        this.white.appendChild(this.critical);

        this.fill.appendChild(this.black);
        this.fill.appendChild(this.draw);
        this.fill.appendChild(this.white);

        this.bar.appendChild(this.scoreAbbreviated);
        this.bar.appendChild(this.score);
        this.bar.appendChild(this.fill);

        this.wrapper.appendChild(this.bar);
        this.root.appendChild(this.wrapper);

        parent.insertBefore(this.root, parent.firstElementChild);
    }

    public update(evaluation: IAbsEvaluation) {
        let percent: number, textScore: string, textScoreAbb: string;

        if (evaluation.isMate) {
            percent = evaluation.score < 0 ? 100 : 0;
            textScoreAbb = "M" + Math.abs(evaluation.score).toString();
            textScore = (evaluation.score < 0 ? "-" : "+") + textScoreAbb;
        } else {
            const maxScore = 500;
            const minScore = -500;
            const smallScore = evaluation.score / 100;

            percent = (evaluation.score - minScore) / (maxScore - minScore);
            percent = 90 - percent * (95 - 5) + 5;

            if (percent < 5) percent = 5;
            else if (percent > 95) percent = 95;

            textScore = evaluation.score >= 0 ? "+" : "";
            textScore += smallScore.toFixed(2);
            textScoreAbb = Math.abs(smallScore).toFixed(1);
        }

        this.white.style.transform = `translate3d(0px, ${percent}%, 0px)`;
        this.score.innerText = textScore;
        this.scoreAbbreviated.innerText = textScoreAbb;
        const classSideAdd =
            evaluation.score >= 0
                ? "evaluation-bar-dark"
                : "evaluation-bar-light";
        const classSideRemove =
            evaluation.score >= 0
                ? "evaluation-bar-light"
                : "evaluation-bar-dark";

        this.score.classList.remove(classSideRemove);
        this.scoreAbbreviated.classList.remove(classSideRemove);

        this.score.classList.add(classSideAdd);
        this.scoreAbbreviated.classList.add(classSideAdd);
    }

    public setFlipped(isFlipped: boolean) {
        if (isFlipped) this.bar.classList.add("evaluation-bar-flipped");
        else this.bar.classList.remove("evaluation-bar-flipped");
    }
}

class EvaluationLineComponent extends BaseUIComponent {
    public readonly button: HTMLButtonElement;
    public readonly buttonIcon: HTMLSpanElement;
    public readonly score: HTMLAnchorElement;
    public readonly nodeContainer: HTMLSpanElement;

    constructor() {
        super("div");
        this.root.classList.add(
            "evaluation-lines-component",
            "evaluation-lines-withicon"
        );

        this.button = document.createElement("button");
        this.button.type = "button";
        this.button.classList.add("evaluation-lines-more");

        this.buttonIcon = document.createElement("span");
        this.buttonIcon.classList.add(
            "evaluation-lines-icon",
            "icon-font-chess",
            "caret-down"
        );
        this.button.appendChild(this.buttonIcon);

        this.score = document.createElement("a");
        this.score.classList.add("evaluation-lines-score");
        this.score.textContent = "+1.73";

        this.nodeContainer = document.createElement("span");

        this.root.appendChild(this.button);
        this.root.appendChild(this.score);
        this.root.appendChild(this.nodeContainer);

        this.button.onclick = () => {
            if (this.root.classList.contains("evaluation-lines-open")) {
                this.button.classList.remove("evaluation-lines-inverted");
                this.root.classList.remove("evaluation-lines-open");
            } else {
                this.button.classList.add("evaluation-lines-inverted");
                this.root.classList.add("evaluation-lines-open");
            }
        };

        this.setVisible(false);
    }

    public update(pv: IPrincipalVariation, moveNumber: number) {
        
        this.nodeContainer.textContent = "";
        const frag = document.createDocumentFragment();

        pv.lineSan.forEach((san, idx) => {
            const wholeMoveNumber = Math.floor((moveNumber + 1) / 2) + 1;
            const isHalfMove = moveNumber % 2 == 0;
            const el = document.createElement("span");
            el.classList.add("evaluation-lines-node");

            let text = "";

            if (!isHalfMove || idx == 0) {
                text = wholeMoveNumber.toString() + ".";
                if (idx == 0) {
                    if (isHalfMove) {
                        text += "..";
                    }
                }
            }

            el.textContent =  text + san + " ";
            frag.appendChild(el);
            moveNumber++;
        });
        
        this.nodeContainer.appendChild(frag.cloneNode(true));

        this.score.textContent = evaluationToString({
            score: pv.absoluteScore,
            isMate: pv.isMate,
        });

        if (pv.absoluteScore >= 0) {
            this.score.classList.remove("evaluation-lines-negative");
        } else {
            this.score.classList.add("evaluation-lines-negative");
        }
    }

    public setVisible(isVisible: boolean) {
        this.root.style.display = isVisible ? "" : "none";
    }
}

class EvaluationLines extends BaseUIComponent {
    private readonly lineComponents: EvaluationLineComponent[];
    constructor() {
        super("div");
        this.root.classList.add("evaluation-lines-lines");
        this.lineComponents = [];
        for (let i = 0; i < EVALUATION_LINES_MAX; i++) {
            this.lineComponents.push(new EvaluationLineComponent());
            this.lineComponents[i].setVisible(false);
            this.root.appendChild(this.lineComponents[i].root);
        }
    }

    public updateLine(moveNumber: number, line: Line) {
        for (let i = 0; i < EVALUATION_LINES_MAX && i < line.pvs.length; i++) {
            this.lineComponents[i].update(line.pvs[i], moveNumber);
            this.lineComponents[i].setVisible(true);
        }

        for (let i = line.pvs.length; i < EVALUATION_LINES_MAX; i++) {
            this.lineComponents[i].setVisible(false);
        }
    }
}

const getClassificationComment = (function () {

    const descriptionMap = new Map<EClassification, string>([
        [EClassification.Best, "is best"],
        [EClassification.Excellent, "is excellent"],
        [EClassification.Good, "is good"],
        [EClassification.Inaccuracy, "is an inaccuracy"],
        [EClassification.Mistake, "is a mistake"],
        [EClassification.Blunder, "is a blunder"],
        [EClassification.Forced, "is forced"],
        [EClassification.Brilliant, "is brilliant"],
        [EClassification.Great, "is a great find"],
        [EClassification.Book, "is a book move"],
        [EClassification.Miss, "is a miss"],
        [EClassification.MissedWin, "is a missed win"],
    ]);

    return (
        classification: EClassification
    ): string => {

        return descriptionMap.get(classification) || "";
    };
})();

class FeedbackRow extends BaseUIComponent {
    private readonly container: HTMLDivElement;
    private readonly icon: HTMLDivElement;
    private readonly thinkingIcon: HTMLDivElement;
    private readonly line: HTMLDivElement;
    private readonly topLine: HTMLDivElement;
    private readonly moves: HTMLDivElement;
    private readonly score: HTMLAnchorElement;
    private isThinking: boolean;
    private cachedThinkingSan: string;
    private isProgressBar: boolean;

    constructor() {
        super("div");
        this.root.classList.add("move-feedback-row");

        this.container = document.createElement("div");
        this.container.classList.add("move-feedback-row-component");

        this.icon = document.createElement("div");
        this.icon.classList.add("move-feedback-row-icon");

        this.thinkingIcon = document.createElement("div");
        this.thinkingIcon.classList.add(
            "move-feedback-row-indicator",
            "move-feedback-row-white"
        );
        this.thinkingIcon.style.display = "none";

        this.line = document.createElement("div");
        this.line.classList.add("move-feedback-row-line");

        this.topLine = document.createElement("div");
        this.topLine.classList.add("move-feedback-row-topline");

        this.moves = document.createElement("div");
        this.moves.classList.add("move-feedback-row-moves");

        this.score = document.createElement("a");
        this.score.classList.add("score-text-score", "move-feedback-row-score");

        this.line.appendChild(this.topLine);
        this.line.appendChild(this.moves);

        this.container.appendChild(this.thinkingIcon);
        this.container.appendChild(this.icon);
        this.container.appendChild(this.line);
        this.container.appendChild(this.score);
        this.root.appendChild(this.container);
        this.isThinking = false;
        this.isProgressBar = false;
        this.cachedThinkingSan = "";
    }

    public setProgressBar() {
        if (this.isProgressBar) {
            return;
        }

        this.isProgressBar = true;

        this.root.innerHTML = `
            <div class="move-feedback-thinking">
                <div class="loader-three-bounce-component loader-three-bounce-circle" data-test-element="loader-three-bounce"
                    style="width: 40px;">
                    <div class="loader-three-bounce-dot loader-three-bounce-bounce1" style="width: 10px; height: 10px;"></div>
                    <div class="loader-three-bounce-dot loader-three-bounce-bounce2" style="width: 10px; height: 10px;"></div>
                    <div class="loader-three-bounce-dot" style="width: 10px; height: 10px;"></div>
                </div>
            </div>`;
    }

    public setThinking(san: TSANotation) {
        if (this.isThinking && this.cachedThinkingSan == san) {
            return;
        }

        this.isThinking = true;

        this.thinkingIcon.style.display = "";
        this.icon.style.display = "none";
        this.score.style.display = "none";

        this.moves.innerHTML = `
        <div class="move-feedback-row-enginewrap">
            <div class="engine-line-component move-feedback-row-engine" is-expandable="false">
                <div class="engine-line-thinking" style="display: none;">
                    <div class="engine-line-thinking-score"></div>
                    <div class="engine-line-thinking-line"></div>
                </div>
            </div>
        </div>`;

        this.setLineText(san, "was played");
    }

    public update(
        moveNumber: number,
        evaluation: IAbsEvaluation,
        classification: EClassification,
        san: TSANotation,
        sanMoves: TSANotation[],
        isBestMoveAlternative: boolean = false
    ) {

        if (this.isThinking) {
            this.isThinking = false;
            this.thinkingIcon.style.display = "none";
            this.icon.style.display = "";
            this.score.style.display = "";
        }

        if (this.isProgressBar) {
            this.isProgressBar = false;
            this.root.innerHTML = "";
            this.root.appendChild(this.container);
        }
        
        let comment = getClassificationComment(classification);

        if (isBestMoveAlternative) {
            comment = "is an alternative";
        }

        this.setLineText(san, comment);
        this.icon.innerHTML = Icons.fromClassification(classification, 26, 26);
        this.score.textContent = evaluationToString(evaluation);

        if (evaluation.score >= 0) {
            this.score.classList.remove("score-text-negative");
        } else {
            this.score.classList.add("score-text-negative");
        }

        if (sanMoves.length == 0) {
            this.moves.innerHTML = "";
        } else {
            let html = "";
            sanMoves.forEach((san, idx) => {
                const wholeMoveNumber = Math.floor((moveNumber + 1) / 2) + 1;
                const isHalfMove = moveNumber % 2 == 0;

                html += `<span class="move-san-component engine-line-node" is-expandable="false">`;

                if (!isHalfMove || idx == 0) {
                    let suffix = ".";
                    if (idx == 0) {
                        if (isHalfMove) {
                            suffix = "...";
                        }
                    }
                    html += `<span class="move-san-premove">${wholeMoveNumber.toString()}${suffix} </span>`;
                }

                html += `<span class="move-san-highlight"><span class="move-san-san">${san} </span></span></span>`;
                moveNumber++;
            });

            this.moves.innerHTML = `
            <div class="move-feedback-row-enginewrap">
              <div class="engine-line-component move-feedback-row-engine" is-expandable="false">
              ${html}
              </div>
            </div>`;
        }
    }

    private setLineText(san: TSANotation, comment: string) {
        this.topLine.innerHTML = `
            <span class="move-san-component move-feedback-row-san move-feedback-row-colored">
                <span class="move-san-highlight">
                <span class="move-san-san">${san}</span>
                </span>
            </span>
            <div class="move-feedback-row-description move-feedback-row-colored">${comment}</div>`;
    }
}

class Feedback {
    public readonly root: HTMLDivElement;
    private readonly container: HTMLDivElement;
    private readonly row1: FeedbackRow;
    private readonly row2: FeedbackRow;

    constructor() {
        this.root = document.createElement("div");
        this.root.classList.add("feedback-wrapper");

        this.container = document.createElement("div");
        this.container.classList.add("move-feedback-component");

        this.row1 = new FeedbackRow();
        this.row2 = new FeedbackRow();
        this.root.appendChild(this.row1.root);
        this.root.appendChild(this.row2.root);
    }

    public updateLine(moveNumber: number, line: Line, previousLine?: Line) {

        // starting position
        if (moveNumber == -1) {
            this.row1.setVisible(false);
            this.row2.setVisible(false);
            return;
        }

        if (previousLine == undefined || !line.isEvaluationFinished() || !previousLine.isEvaluationFinished()){
            this.row1.setThinking(line.san);
            this.row2.setProgressBar();
            this.row1.setVisible(true);
            this.row2.setVisible(true);
            return;
        }

        let evaluation = line.getEvaluation();
        let classification = line.getClassification();
        if (classification === undefined) {
            return;
        }

        if (line.lan == previousLine.getBestMove()) {
            this.row1.update(
                moveNumber,
                evaluation,
                classification,
                line.san,
                line.pvs[0].lineSan
            );

            this.row1.setVisible(true);
            this.row2.setVisible(false);
            return;
        }

        this.row1.update(moveNumber, evaluation, classification, line.san, []);
        this.row1.setVisible(true);

        let suggestedPv = previousLine.getBestPv();
        if (suggestedPv === undefined) {
            this.row2.setVisible(false);
            return;
        }

        this.row2.update(
            moveNumber,
            previousLine.getEvaluation(),
            EClassification.Best,
            suggestedPv.san,
            suggestedPv.lineSan.slice(1),
            classification == EClassification.Best
        );
        this.row2.setVisible(true);
    }

    public clear() {
        this.row1.setVisible(false);
        this.row2.setVisible(false);
    }
}

export class AnalysisUI {
    public readonly root: HTMLDivElement;
    private readonly evaluationBar: EvaluationBar;
    private readonly evaluationLines: EvaluationLines;
    private readonly feedback: Feedback;

    constructor(evaluationBarContainer: HTMLElement) {
        this.root = document.createElement("div");
        this.root.classList.add("play-controller-above-move-list");
        this.evaluationBar = new EvaluationBar(evaluationBarContainer);
        this.evaluationLines = new EvaluationLines();
        this.feedback = new Feedback();
        this.root.appendChild(this.evaluationLines.root);
        this.root.appendChild(this.feedback.root);
    }

    public updateLine(moveNumber: number, line: Line, previousLine?: Line) {
        this.evaluationBar.update(line.getEvaluation());
        this.evaluationLines.updateLine(moveNumber, line);
        this.feedback.updateLine(moveNumber, line, previousLine);
    }

    public setFlipped(isFlipped: boolean) {
        this.evaluationBar.setFlipped(isFlipped)
    }
}