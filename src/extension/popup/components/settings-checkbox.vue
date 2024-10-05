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
.toggle {
    input[type=checkbox] {
        display: none;
    }
}

.slide-toggle {
    display: block;
    position: relative;
    flex: none;
    width: 50px;
    height: 30px;
    border-radius: 30px;
    background-color: #7f7f7f;
    cursor: pointer;
    transition: all 0.1s ease-in-out;
    z-index: 1;
    margin: 10px;

    &::before,
    &::after {
        content: ' ';
        display: block;
        position: absolute;
        top: 1px;
        border-radius: 30px;
        height: 28px;
        background-color: #fff;
        transform: translate3d(0, 0, 0);
        transition: 0.2s cubic-bezier(0, 1.1, 1, 1.1);
        ;
    }

    &::before {
        z-index: -1;
        width: 48px;
        right: 1px;
        transform: scale(1);
        background-color: #3f3f3f;
    }

    &::after {
        z-index: 1;
        width: 28px;
        left: 1px;
        box-shadow: 0 1px 4px 0.5px rgba(0, 0, 0, 0.25);
    }

    input:checked+& {
        background-color: #3bc244;

        &::before {
            transform: scale(0);
        }

        &::after {
            transform: translate3d(20px, 0, 0);
        }
    }
}
</style>