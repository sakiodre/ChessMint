<template>
    <SettingsRow label="Display arrows">
        <SettingsCheckBox v-model="options.showArrows"/>
    </SettingsRow>
    <SettingsRow label="Move classification">
        <SettingsCheckBox v-model="options.showClassification"/>
    </SettingsRow>
    <SettingsRow label="Evaluation Bar">
        <SettingsCheckBox v-model="options.showEvalBar"/>
    </SettingsRow>
    <SettingsRow label="Evaluation lines">
        <SettingsCheckBox v-model="options.showEvalLines"/>
    </SettingsRow>
    <SettingsRow label="Feedback">
        <SettingsCheckBox v-model="options.showFeedback"/>
    </SettingsRow>
</template>

<script setup lang="ts">
import SettingsRow from "./settings-row.vue"
import SettingsCheckBox from "./settings-checkbox.vue"
import { options } from "@/options";

</script>

<style scoped lang="scss">
</style>