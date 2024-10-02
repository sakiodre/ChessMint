<template>
    <div class="evaluation-lines-lines">
        <EvaluationLinesComponent v-for="pv in line.pvs" :pv="pv" :move-number="moveNumber"/>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { Line } from '@/position';
import EvaluationLinesComponent from './evaluation-lines-component.vue';

defineProps({
    line: {
        required: true,
        type: Object as PropType<Line>
    },
    moveNumber: {
        required: true,
        type: Number
    }
})

</script>