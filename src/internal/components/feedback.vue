<template>
    <div class="feedback-wrapper">
        <FeedbackRow v-if="data.moveNumber != -1 && data.currentLine" 
            :moveNumber="data.moveNumber"
            :is-thinking="false"
            :is-finished="!isThinking()" 
            :classification="data.currentLine!.getClassification() || EClassification.Best"
            :san="data.currentLine!.san"
            :line-san="isCurrentLineBestMove() ? data.currentLine!.pvs[0]?.lineSan ?? [] : []"
            :evaluation="data.currentLine!.getEvaluation()"
            />

        <FeedbackRow v-if="data.moveNumber != -1 && !isCurrentLineBestMove()"
            :moveNumber="data.moveNumber" 
            :is-thinking="isThinking()"
            :is-finished="true"
            :classification="EClassification.Best" 
            :san="data.previousLine?.pvs[0]?.san ?? ''"
            :line-san="data.previousLine?.pvs[0]?.lineSan.slice(1) ?? []" 
            :evaluation="data.previousLine?.getEvaluation()"
            :is-alternative="isBestMoveAlternative()"
            />
    </div>
</template>

<script setup lang="ts">
import FeedbackRow from './feedback-row.vue';
import { EClassification } from '@/types/chessboard';
import { getAnalysisData } from './sidebar-analysis';

const data = getAnalysisData();

function isThinking()  {
    if (data.currentLine === undefined || data.previousLine === undefined)
    {
        return true;
    }

    return !data.currentLine.isEvaluationFinished() || !data.previousLine.isEvaluationFinished();
}

function isCurrentLineBestMove() {
    return !isThinking() && data.currentLine!.lan == data.previousLine!.getBestMove();
}

function isBestMoveAlternative() {
    return isCurrentLineBestMove() && data.currentLine!.getClassification() === EClassification.Best;
}

</script>