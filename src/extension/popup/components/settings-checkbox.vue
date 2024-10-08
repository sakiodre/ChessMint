<template>
    <label class="toggle">
        <input type="checkbox" :checked="modelValue" @change="updateValue($event)">
        <div class="slide-toggle"></div>
    </label>
</template>

<script setup lang="ts">
defineProps({
    modelValue: {
        required: true,
        type: Boolean,
    }
})

const emit = defineEmits(['update:modelValue']);

function updateValue(event: Event) {
    emit('update:modelValue', (event.target as HTMLInputElement).checked)
}

</script>
<style scoped lang="scss">
@import "../global.scss";

$slider-width: 3.5rem;
$slider-height: 2rem;
$thumb-padding: $slider-height * 0.1;
$thumb-size: $slider-height - $thumb-padding;

.toggle {
    input[type=checkbox] {
        display: none;
    }
}

.slide-toggle {
    display: block;
    position: relative;
    flex: none;
    width: $slider-width;
    height: $slider-height;
    border-radius: $slider-height;
    background-color: $border-color-dark;
    cursor: pointer;
    z-index: 1;

    &::before,
    &::after {
        content: ' ';
        display: block;
        position: absolute;
        top: ($slider-height - $thumb-size) * 0.5;
        border-radius: $slider-height;
        height: $thumb-size;
        background-color: $font-color;
        transform: translate3d($thumb-padding * 0.5, 0, 0);
        transition: 0.1s cubic-bezier(0, 1.1, 1, 1.1);
        ;
    }

    &::before {
        z-index: -1;
        width: $slider-width - $thumb-padding * 2;
        right: $thumb-padding * 0.5;
        transform: scale(1);
        background-color: $button-background;
    }

    &::after {
        z-index: 1;
        width: $thumb-size;
    }

    input:checked+& {
        background-color: #3bc244;

        &::before {
            transform: scale(0);
        }

        &::after {
            transform: translate3d($slider-width - $thumb-size - $thumb-padding * 0.5, 0, 0);
        }
    }
}
</style>