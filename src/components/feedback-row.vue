<template>
    <div class="move-feedback-row">

        <div v-if="isThinking" class="move-feedback-thinking">
            <div class="loader-three-bounce-component loader-three-bounce-circle" data-test-element="loader-three-bounce" style="width: 40px;">
                <div class="loader-three-bounce-dot loader-three-bounce-bounce1" style="width: 10px; height: 10px;"></div>
                <div class="loader-three-bounce-dot loader-three-bounce-bounce2" style="width: 10px; height: 10px;"></div>
                <div class="loader-three-bounce-dot" style="width: 10px; height: 10px;"></div>
            </div>
        </div>

        <div v-else class="move-feedback-row-component">
            <div :class="isFinished ? 'move-feedback-row-icon' : 'move-feedback-row-indicator move-feedback-row-white'" v-html="classificationIcon">
            </div>

            <div class="move-feedback-row-line">

                <div class="move-feedback-row-topline">
                    <span class="move-san-component move-feedback-row-san move-feedback-row-colored">
                        <span class="move-san-highlight">
                            <span class="move-san-san">{{ san }}</span>
                        </span>
                    </span>
                    <div class="move-feedback-row-description move-feedback-row-colored">{{ classificationComment }}</div>
                </div>

                <div class="move-feedback-row-moves">
                    <div class="move-feedback-row-enginewrap">
                        <div class="engine-line-component move-feedback-row-engine" is-expandable="false">

                            <span v-for="(san, index) in lineSan" class="move-san-component engine-line-node" is-expandable="false">
                                <span v-if="index == 0 || (moveNumber+index) % 2 !== 0" class="move-san-premove">{{ getMoveNumberIndex(index) }}</span>
                                <span class="move-san-highlight">
                                    <span class="move-san-san">{{ san + " " }}</span>
                                </span>
                            </span>

                        </div>
                    </div>
                </div>

            </div>
            <a v-if="isFinished && evaluation" 
                class="score-text-score move-feedback-row-score"
                :class="{ 'score-text-negative': evaluation.score < 0 }">{{ evaluationToString(evaluation) }}
            </a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { Icons } from '@/assets/icons';
import { evaluationToString } from '@/utils/utils';
import { EClassification } from '@/types/chessboard';

const props = defineProps({
    moveNumber: {
        required: true,
        type: Number
    },
    isFinished: {
        required: true,
        type: Boolean,
    },
    isThinking: {
        required: true,
        type: Boolean,
    },
    classification: {
        required: true,
        type: Number as PropType<EClassification>,
    },
    san: {
        required: true,
        type: String as PropType<TSANotation>,
    },
    lineSan: {
        required: true,
        type: Array as PropType<TSANotation[]>,
    },
    evaluation: {
        type: Object as PropType<IAbsEvaluation>,
    },
    isAlternative: {
        type: Boolean,
    }
})

const commentMap = new Map<EClassification, string>([
    [EClassification.Best, "is best"],
    [EClassification.Excellent, "is excellent"],
    [EClassification.Good, "is good"],
    [EClassification.Inaccuracy, "is an inaccuracy"],
    [EClassification.Mistake, "is a mistake"],
    [EClassification.Blunder, "is a blunder"],
    [EClassification.Forced, "is forced"],
    [EClassification.Brilliant, "is brilliant"],
    [EClassification.Great, "is a great find"],
    [EClassification.Book, "is a book move"],
    [EClassification.Miss, "is a miss"],
    [EClassification.MissedWin, "is a missed win"],
]);

const classificationIcon = computed(() => {
    return props.isFinished ? Icons.fromClassification(props.classification, 26, 26) : ""
})

const classificationComment = computed(() =>
{
    if (!props.isFinished)
        return "was played";

    if (props.isAlternative)
        return "is an alternative";

    return commentMap.get(props.classification) || "";
})

function getMoveNumberIndex(index: number)
{
    const moveNumber = props.moveNumber + index;
    const wholeMoveNumber = Math.floor((moveNumber + 1) / 2) + 1;
    const isHalfMove = moveNumber % 2 == 0;

    if (isHalfMove)
    {
        return `${wholeMoveNumber.toString()}... `;
    }

    return `${wholeMoveNumber.toString()}. `;
}
</script>