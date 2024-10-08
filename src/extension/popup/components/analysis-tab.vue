<template>
    <SettingsRow label="Display arrows">
        <SettingsCheckBox v-model="options.showArrows"/>
    </SettingsRow>
    <SettingsRow label="Move classification">
        <SettingsCheckBox v-model="options.showClassification"/>
    </SettingsRow>
    <SettingsRow label="Evaluation bar">
        <SettingsCheckBox v-model="options.showEvalBar"/>
    </SettingsRow>
    <SettingsRow label="Engine lines">
        <SettingsCheckBox v-model="options.showEvalLines"/>
    </SettingsRow>
    <SettingsRow label="Move Feedback">
        <SettingsCheckBox v-model="options.showFeedback"/>
    </SettingsRow>
    <SettingsRow label="Number of arrows">
        <SettingsNumber v-model="options.multiPv" :min="1" :max="5"/>
    </SettingsRow>
</template>

<script setup lang="ts">
import SettingsRow from "./settings-row.vue"
import SettingsCheckBox from "./settings-checkbox.vue"
import SettingsNumber from "./settings-number.vue"
import { options } from "@/options";

</script>

<style scoped lang="scss">
</style>