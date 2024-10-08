<template>
    <div :class="$style.container">
        <div :class="[$style.bar, { [$style.flipped]: isFlipped }]">

            <span :class="[$style.scoreAbbreviated, evaluation.score >= 0 ? $style.darkScore : $style.lightScore]">
                {{ evaluationToString(evaluation, true) }}
            </span>

            <span :class="[$style.score, evaluation.score >= 0 ? $style.darkScore : $style.lightScore]">
                {{ evaluationToString(evaluation, false) }}
            </span>
        
            <div :class="$style.fill">
                <div :class="[$style.color, $style.black]"></div>
                <div :class="[$style.color, $style.draw]"></div>
                <div :class="[$style.color, $style.white]" :style="getTransform(evaluation)"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { evaluationToString } from '@/utils/utils';
import { computed } from 'vue'
import { getAnalysisData } from './analysis';

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

<style module lang="scss">

.container {
    flex: 1 1 auto;
    --barWidth: 2rem;
}

@media (min-width: 960px) {
    .container {
    flex: 1 1 auto;
        --barWidth: 3rem;
    }
}


.bar {
    border-radius: .2rem;
    height: 100%;
    position: relative;
    width: var(--barWidth);


    .score {
        display: none;
        font-size: 1.2rem;
        font-weight: 600;
        -webkit-hyphens: auto;
        hyphens: auto;
        padding: .5rem .2rem;
        position: absolute;
        text-align: center;
        width: 100%;
        z-index: 2;
    }

    .scoreAbbreviated {
        font-size: 1rem;
        font-weight: 600;
        padding: .5rem 0;
        position: absolute;
        text-align: center;
        white-space: pre;
        width: 100%;
        z-index: 2;
    }

    .darkScore {
        bottom: 0;
        color: #403d39
    }

    .lightScore {
        color: #ffffff;
        top: 0
    }
    
    .fill {
        background-color: hsla(0,0%,100%,.05);
        border-radius: .2rem;
        height: 100%;
        overflow: hidden;
        position: relative;
        width: 100%;
        z-index: -1;
        
        .color {
            bottom: 0;
            height: 100%;
            left: 0;
            position: absolute;
            transition: transform 1s ease-in;
            width: 100%;

            &.black {
                background-color: #403d39;
                z-index: 1;
            }
            &.draw {
                background-color: #777574;
                z-index: 0;
            }

            &.white {
                background-color: #ffffff;
                z-index: 2;
            }
        }
    }
    
    &:hover .score {
        border-radius: .3rem;
        bottom: auto;
        display: block;
        font-weight: 700;
        -webkit-hyphens: auto;
        hyphens: auto;
        padding: .1rem .5rem;
        position: absolute;
        text-align: center;
        top: 50%;
        transform: translate(calc(var(--barWidth)/2 - 50%), -50%) var(--scoreTransform, rotate(0deg));
        transition: opacity .2s;
        transition-delay: .1s;
        width: 4.5rem;
        z-index: 2
    }

    &:hover .score.darkScore {
        background-color: #fff;
        color: #403d39
    }

    &:hover .score.lightScore {
        background-color: #403d39;
        color: #fff;
    }
    
    &.flipped, &.flipped .scoreAbbreviated {
        transform: rotate(180deg);
        --scoreTransform: rotate(180deg);
    }
}


</style>