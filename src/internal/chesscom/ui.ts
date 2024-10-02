import { createApp } from "vue";
import SidebarAnalysis from "@/components/sidebar-analysis.vue"
import EvaluationBar from "@/components/evaluation-bar.vue"
import { Line } from "@/position";

export class AnalysisUI {
    public readonly evalbarContainer: HTMLDivElement;
    public readonly sidebarContainer: HTMLDivElement;
    private readonly evaluationBar: any;
    private readonly sidebarAnalysis: any;

    constructor() {
        this.sidebarContainer = document.createElement("div");
        this.evalbarContainer = document.createElement("div");

        let sidebarApp = createApp(SidebarAnalysis);
        this.sidebarAnalysis = sidebarApp.mount(this.sidebarContainer);

        let evalbarApp = createApp(EvaluationBar);
        this.evaluationBar = evalbarApp.mount(this.evalbarContainer);
    }

    public mountEvalbar(container: HTMLElement) {
        container.insertBefore(
            this.evalbarContainer.firstChild!,
            container.firstElementChild
        );
    }

    public mountSidebar(container: HTMLElement) {
        container.insertBefore(this.sidebarContainer.firstChild!, container.firstElementChild);
    }

    public updateLine(moveNumber: number, line: Line, previousLine?: Line) {
        this.evaluationBar.update(line.getEvaluation());
        this.sidebarAnalysis.update(moveNumber, line, previousLine);
    }

    public setFlipped(isFlipped: boolean) {
        this.evaluationBar.setFlipped(isFlipped)
    }
}