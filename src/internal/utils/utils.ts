export const evaluationToString = (evaluation: IAbsEvaluation, isAbbreviation:boolean = false) => {
    let prefix = "";

    if (!isAbbreviation) {
        if (evaluation.isMate) {
            prefix = evaluation.score >= 0 ? "+M" : "-M";
        } else {
            prefix = evaluation.score >= 0 ? "+" : "";
        }
    }

    if (evaluation.isMate) {
        return prefix + Math.abs(evaluation.score).toString();
    } else {
        return prefix + (evaluation.score / 100).toFixed(2);
    }
}