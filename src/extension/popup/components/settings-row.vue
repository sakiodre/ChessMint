<template>
    <div class="settings-field-row">
        <div class="settings-field-label">{{ label }}</div>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
defineProps({
    label: {
        required: true,
        type: String,
    }
})
</script>

<style scoped lang="scss">
.settings-field-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .settings-field-label {
        font-size: 1.1rem;
    }
}
</style>