import { Line } from "@/position";
import { inject } from "vue";

export interface AnalysisData {
    moveNumber: number;
    currentLine: Line | undefined;
    previousLine: Line | undefined;
}

export function getAnalysisData(): AnalysisData {
    return inject<AnalysisData>("data", {
        moveNumber: -1,
        currentLine: undefined,
        previousLine: undefined,
    });
}