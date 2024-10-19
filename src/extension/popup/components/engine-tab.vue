<template>
    <SettingsRow label="Engine depth">
        <SettingsNumber v-model="options.engineDepth" :min="1" :max="30" />
    </SettingsRow>
    <SettingsRow label="Number of threads">
        <SettingsNumber v-model="options.engineThreads" :min="1" :max="16" />
    </SettingsRow>
    <SettingsRow label="Hash table size (MB)">
        <SettingsNumber v-model="options.engineHash" :min="512" :max="4096" :step="512"/>
    </SettingsRow>
    <SettingsRow label="Use external engine">
        <SettingsCheckBox v-model="options.engineUseExternal"/>
    </SettingsRow>
    <SettingsRow v-if="options.engineUseExternal" label="External engine port">
        <SettingsNumber v-model="options.engineExternalPort" :min="1" :max="65535" :step="1"/>
    </SettingsRow>
</template>

<script setup lang="ts">
import SettingsRow from "./settings-row.vue"
import SettingsCheckBox from "./settings-checkbox.vue"
import SettingsNumber from "./settings-number.vue"
import { options } from "@/options";

</script>

<style scoped lang="scss"></style>