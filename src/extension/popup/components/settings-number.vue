<template>
    <div class="input-number">
    	<span class="button minus" :class="{ 'disabled': min && modelValue <= min }" @click="updateValue(modelValue - (step ?? 1))"></span>
    	<span class="text-edit" contenteditable="true" @focusout="onFocusOut($event)" @keydown="onKeyDown($event)">
            {{ modelValue }}
        </span>
    	<span class="button plus" :class="{'disabled': max && modelValue >= max}" @click="updateValue(modelValue + (step ?? 1))"></span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    modelValue: {
        required: true,
        type: Number,
    },
    min: {
        type: Number,
    },
    max: {
        type: Number,
    },
    step: {
        type: Number,
    }
})

const emit = defineEmits(['update:modelValue']);

function updateValue(value: number) {
    if (props.min && value < props.min) {
        value = props.min;
    }
    if (props.max && value > props.max) {
        value = props.max;
    }
    if (value === props.modelValue)
    {
        return;
    }
    emit('update:modelValue', value)
}

function onFocusOut(event: Event) {
    const target = event.target as HTMLSpanElement;
    window.getSelection()?.removeAllRanges();

    const textContent = target.textContent ?? "";
    
    let value = +textContent;
    if (textContent === "") {
        target.textContent = String(props.modelValue);
        value = props.modelValue;
    }

    
    if (props.min && value < props.min)
    {
        value = props.min;
    }
    else if (props.max && value > props.max)
    {
        value = props.max;
    }

    target.textContent = String(value);
    updateValue(value);
}

function onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLSpanElement;
    console.log(event.key);
    if (event.key === "Enter")
    {
        target.blur();
    } else if (event.key.length == 1 && !event.shiftKey && !event.ctrlKey && !event.altKey)
    {
        if  (event.key < '0' || event.key > '9'){
            event.preventDefault();
        }
    }
}

</script>
<style scoped lang="scss">
@import  "../global.scss";

span {cursor:pointer; }
.input-number{
    display: flex;
    .button {
        width: 2rem;
        background:#252629;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $font-color-inactive;

        &:not(.disabled):hover {
            color: $font-color;
            background: $button-background;
        }

        &:not(.disabled):active {
            background: $button-background-active;
        }

        &.minus {
            border-radius: 1rem 0 0 1rem;
        }
        &.plus {
            border-radius: 0 1rem 1rem 0;
        }
        &.minus::before {
            content: "-";
        }
        &.plus::before {
            content: "+";
        }

        &.disabled {
            color: $font-color-disabled;
            cursor: default;
        }
    }
}

.text-edit{
    background-color: $input-background;
    height:2rem;
    min-width: 1rem;
    font-size: 1rem;
    border:0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 0.3rem;
    cursor: text;
}
.text-edit:focus {
    outline: none;
}

</style>