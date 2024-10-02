import { IEnginePv } from "@/engine";

export const evaluationToString = (evaluation: IAbsEvaluation, isAbbreviation:boolean = false) => {
    let prefix = "";

    if (isAbbreviation === false) {
        if (evaluation.isMate) {
            prefix = evaluation.score >= 0 ? "+M" : "-M";
        } else {
            prefix = evaluation.score >= 0 ? "+" : "-";
        }
    }

    if (evaluation.isMate) {
        return prefix + Math.abs(evaluation.score).toString();
    } else {
        return (
            prefix +
            (Math.abs(evaluation.score) / 100).toFixed(isAbbreviation ? 1 : 2)
        );
    }
}

export const pvEvaluationToString = (
    pv: IEnginePv,
    isAbbreviation: boolean = false
) => {
    return evaluationToString({ score: pv.absoluteScore, isMate: pv.isMate }, isAbbreviation);
};