import { createApp } from "vue";
import SidebarAnalysis from "@/components/sidebar-analysis.vue"
import { Line } from "@/position";

export class AnalysisUI {
    public readonly container: HTMLElement;
    private readonly component: any;

    constructor() {
        let container = document.createElement("div");

        let app = createApp(SidebarAnalysis);
        this.component = app.mount(container);
        this.container = container.firstChild! as HTMLElement;
    }

    public mountEvalbar(container: HTMLElement) {
        this.component.mountEvalBar(container);
    }

    public mountSidebar(container: HTMLElement) {
        container.insertBefore(
            this.container,
            container.firstElementChild
        );
    }

    public updateLine(moveNumber: number, line: Line, previousLine?: Line) {
        this.component.update(moveNumber, line, previousLine);
    }

    public setFlipped(isFlipped: boolean) {
        this.component.setFlipped(isFlipped);
    }
}