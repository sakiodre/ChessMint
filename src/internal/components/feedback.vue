<template>
    <div class="feedback-wrapper">
        <FeedbackRow v-if="moveNumber != -1 && currentLine" 
            :moveNumber="moveNumber"
            :is-thinking="false"
            :is-finished="!isThinking()" 
            :classification="currentLine.getClassification() || EClassification.Best"
            :san="currentLine.san"
            :line-san="isCurrentLineBestMove() ? currentLine.pvs[0]?.lineSan ?? [] : []"
            :evaluation="currentLine.getEvaluation()"
            />

        <FeedbackRow v-if="moveNumber != -1 && !isCurrentLineBestMove()" 
            :moveNumber="moveNumber" 
            :is-thinking="isThinking()" 
            :is-finished="true"
            :classification="EClassification.Best" 
            :san="previousLine?.pvs[0]?.san ?? ''"
            :line-san="previousLine?.pvs[0]?.lineSan.slice(1) ?? []" 
            :evaluation="previousLine?.getEvaluation()"
            />
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { Line } from '@/position';
import FeedbackRow from './feedback-row.vue';
import { EClassification } from '@/types/chessboard';

const props = defineProps({
    currentLine: {
        type: Object as PropType<Line> 
    },
    previousLine: {
        type: Object as PropType<Line> 
    },
    moveNumber: {
        required: true,
        type: Number
    }
})

function isThinking() {
    if (props.currentLine === undefined || props.previousLine === undefined) {
        return true;
    }

    return !props.currentLine.isEvaluationFinished() || !props.previousLine.isEvaluationFinished()
}

function isCurrentLineBestMove() {
    return !isThinking() && props.currentLine?.lan == props.previousLine?.getBestMove();
}

</script>