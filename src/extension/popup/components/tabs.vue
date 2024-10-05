<template>
    <div role="tablist" class="tabs-component">
        <div
            v-for="tab in tabs"
            @click="selectedTabId = tab.id"
            class="tabs-tab"
            :class="{ 'tabs-active': selectedTabId == tab.id }"
            role="tab"
            tabindex="0"
        >
            <div class="tabs-icon" v-html="tab.icon"></div>

            <span class="tabs-label">{{ tab.title }}</span>
        </div>
    </div>
    <div class="tab-content-component" role="tabpanel">
        <component v-if="selectedTab" :is="selectedTab!.component"></component>
    </div>
</template>

<script setup lang="ts">
import { PropType, computed, ref } from "vue";
import { ITabData } from "./tabs";
const props = defineProps({
    tabs: {
        required: true,
        type: Object as PropType<ITabData[]>,
    },
});

const selectedTabId = ref("");

if (props.tabs.length > 0) {
    if (
        selectedTabId.value === "" ||
        props.tabs.findIndex((tab) => tab.id === selectedTabId.value) === -1
    ) {
        selectedTabId.value = props.tabs[0].id;
    }
}

const selectedTab = computed(() => {
    return props.tabs.find((tab) => tab.id === selectedTabId.value);
});
</script>

<style>
:root {
    --primary-color: #ffffff;
    --primary-color-inactive: #afafaf;
}
.tabs-component {
    display: flex;
    flex: 0 0 auto;
}

.tabs-tab {
    align-items: center;
    cursor: pointer;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: 0.4rem;
    justify-content: center;
    min-width: 0;
    padding: 0.8rem 0 0.8rem 0;
    position: relative;
}

.tabs-tab.tabs-active {
    cursor: default;
    border-radius: 100px;
    color: var(--primary-color);
    --tab-icon-color: var(--primary-color);
}

.tabs-tab:not(.tabs-active) {
    background-color: #202123;
    color: var(--primary-color-inactive);
    --tab-icon-color: var(--primary-color-inactive);
}

.tab-content-component {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-height: 0;
    padding: 0.5rem 1rem;
}

.tabs-label {
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.1;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100% - 0.8rem);
}

.tabs-icon {
    height: 1.2rem;
}

.tabs-icon>svg>path{ /*target the image with css*/
    fill: var(--tab-icon-color);
}
</style>
