<template>
    <div class="evaluation-lines-lines">
        <EvaluationLinesComponent v-if="data.currentLine" v-for="pv in data.currentLine.pvs" :pv="pv" :move-number="data.moveNumber"/>
    </div>
</template>

<script setup lang="ts">
import EvaluationLinesComponent from './evaluation-lines-component.vue';
import { getAnalysisData } from './sidebar-analysis';

const data = getAnalysisData();

</script>