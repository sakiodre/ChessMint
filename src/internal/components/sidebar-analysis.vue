<template>
    <div class="play-controller-above-move-list">
        <!-- @vue-skip -->
        <EvaluationLines v-if="currentLine" :line="currentLine" :move-number="moveNumber"/>
        <!-- @vue-skip -->
        <Feedback :current-line="currentLine" :previous-line="previousLine" :move-number="moveNumber"/>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Line } from '@/position';
import EvaluationLines from './evaluation-lines.vue';
import Feedback from './feedback.vue';


const moveNumber = ref(-1);
const currentLine = ref<Line | undefined>(undefined);
const previousLine = ref<Line | undefined>(undefined);

function update(m: number, curLine: Line, prevLine?: Line)
{
    moveNumber.value = m;
    currentLine.value = curLine ? Object.assign(Object.create(Object.getPrototypeOf(curLine)), curLine) : undefined;
    previousLine.value = prevLine ? Object.assign(Object.create(Object.getPrototypeOf(prevLine)), prevLine) : undefined;
}

defineExpose({
    update,
})

</script>