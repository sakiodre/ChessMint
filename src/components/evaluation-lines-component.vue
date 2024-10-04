<template>
    <div class="evaluation-lines-component evaluation-lines-withicon" :class="{ 'evaluation-lines-open': isExpanded }" :depth="pv.depth">
        <button @click="expandLine()" type="button" class="evaluation-lines-more" :class="{ 'evaluation-lines-inverted': isExpanded }">
            <span class="evaluation-lines-icon icon-font-chess caret-down"></span>
        </button>
        <a class="evaluation-lines-score" :class="{ 'evaluation-lines-negative': pv.absoluteScore < 0 }">
            {{ pvEvaluationToString(pv, false) }}
        </a>
        <span v-for="(san, index) in pv.lineSan" class="evaluation-lines-node">
            {{ getSanNode(san, index) }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import { IPrincipalVariation } from '@/position';
import { pvEvaluationToString } from '@/utils/utils';

const props = defineProps({
    pv: {
        required: true,
        type: Object as PropType<IPrincipalVariation>
    },
    moveNumber: {
        required: true,
        type: Number
    }
})

const isExpanded = ref(false);

function expandLine()
{
    isExpanded.value = !isExpanded.value;
}

function getSanNode(san: TSANotation, index: number)
{
    const wholeMoveNumber = Math.floor((props.moveNumber + 1) / 2) + 1;
    const isHalfMove = props.moveNumber % 2 == 0;

    let text = "";

    if (!isHalfMove || index == 0)
    {
        text = wholeMoveNumber.toString() + ".";
        if (index == 0 && isHalfMove)
        {
            text += "..";
        }
    }

    return text + san + " ";
}


</script>