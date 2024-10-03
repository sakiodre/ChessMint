<template>
    <div class="board-layout-evaluation">
        <div style="flex: 1 1 auto">
            <div class="evaluation-bar-bar evaluation-bar-wide-eval-bar" :class="{'evaluation-bar-flipped': isFlipped}">
                <span class="evaluation-bar-scoreAbbreviated" :class="evaluation.score >= 0 ? 'evaluation-bar-dark' : 'evaluation-bar-light'">{{ evaluationToString(evaluation, true) }}</span>
                <span class="evaluation-bar-score" :class="evaluation.score >= 0 ? 'evaluation-bar-dark' : 'evaluation-bar-light'">{{ evaluationToString(evaluation, false) }}</span>
                <div class="evaluation-bar-fill">
                    <div class="evaluation-bar-color evaluation-bar-black"></div>
                    <div class="evaluation-bar-color evaluation-bar-draw"></div>
                    <div class="evaluation-bar-color evaluation-bar-white" :style="getTransform(evaluation)">
                        <span class="evaluation-bar-critical"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { evaluationToString } from '@/utils/utils';
import { computed } from 'vue'
import { getAnalysisData } from './sidebar-analysis';

const data = getAnalysisData();

const evaluation = computed(() => {
    return data.currentLine?.getEvaluation() ?? { score: 0, isMate: false }
})

defineProps({
    isFlipped: {
        type: Boolean
    }
})

function getTransform(evaluation: IAbsEvaluation) {
    
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

    return `transform: translate3d(0px, ${percent}%, 0px)`
}

</script>