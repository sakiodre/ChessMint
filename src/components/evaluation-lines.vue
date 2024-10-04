<template>
    <div class="evaluation-lines-lines">
        <EvaluationLinesComponent v-for="pv in data.currentLine?.pvs" :pv="pv" :move-number="data.moveNumber"/>
    </div>
</template>

<script setup lang="ts">
import EvaluationLinesComponent from './evaluation-lines-component.vue';
import { getAnalysisData } from './analysis';

const data = getAnalysisData();

</script>