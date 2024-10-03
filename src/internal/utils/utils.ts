import { IEnginePv } from "@/engine";

export const evaluationToString = (evaluation: IAbsEvaluation, isAbbreviation:boolean = false) => {
    let prefix = "";

    if (isAbbreviation === false) {
        if (evaluation.isMate) {
            return (
                (evaluation.score >= 0 ? "+M" : "-M") +
                Math.abs(evaluation.score).toString()
            );
        } else {
            return (
                (evaluation.score >= 0 ? "+" : "") +
                (evaluation.score / 100).toFixed(2)
            );
        }
    }

    if (evaluation.isMate) {
        return "M" + Math.abs(evaluation.score).toString();
    } else {
        return Math.abs(evaluation.score / 100).toFixed(1);
    }
}

export const pvEvaluationToString = (
    pv: IEnginePv,
    isAbbreviation: boolean = false
) => {
    return evaluationToString({ score: pv.absoluteScore, isMate: pv.isMate }, isAbbreviation);
};