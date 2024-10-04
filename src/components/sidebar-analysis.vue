<template>
    <div class="play-controller-above-move-list">
        <EvaluationLines/>
        <Feedback/>
        <Teleport v-if="evalBarContainer" :to="evalBarContainer">
            <EvaluationBar :is-flipped="isFlipped"/>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { provide, reactive, ref } from 'vue';
import { Line } from '@/position';
import { AnalysisData } from './analysis';
import EvaluationLines from './evaluation-lines.vue';
import Feedback from './feedback.vue';
import EvaluationBar from './evaluation-bar.vue';

// const feedback = ref< InstanceType<typeof Feedback>>();

const evalBarContainer = ref<Element>();
const isFlipped = ref(false);

const data = reactive<AnalysisData>({
    moveNumber: -1,
    currentLine: undefined,
    previousLine: undefined
})

provide("data", data);

function update(m: number, curLine: Line, prevLine?: Line)
{
    data.moveNumber = m;
    data.currentLine = curLine ? Object.assign(Object.create(Object.getPrototypeOf(curLine)), curLine) : undefined;
    data.previousLine = prevLine ? Object.assign(Object.create(Object.getPrototypeOf(prevLine)), prevLine) : undefined;
}

function mountEvalBar(container?: Element) {
    evalBarContainer.value = container;
}

function setFlipped(flip: boolean) {
    isFlipped.value = flip;
}

defineExpose({
    update,
    mountEvalBar,
    setFlipped,
})

</script>