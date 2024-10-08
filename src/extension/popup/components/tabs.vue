<template>
    <div class="tabs-container">
        <div role="tablist" class="tabs-component">
            <div
                v-for="tab in tabs"
                @click="selectedTabId = tab.id"
                class="tabs-tab"
                :class="{ 'tabs-active': selectedTabId == tab.id }"
                role="tab"
                tabindex="0"
            >
                <div class="tabs-icon" v-html="tab.icon" :style="selectedTabId == tab.id ? 'fill: #ffffff' : 'fill: #afafaf'"></div>

                <span class="tabs-label">{{ tab.title }}</span>
            </div>
        </div>
        <div v-for="tab in tabs" v-show="selectedTabId == tab.id" class="tab-content-component" role="tabpanel">
            <component :is="tab!.component"></component>
        </div>
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

<style scoped lang="scss">
@import "../global.scss";

.tabs-container {
    display: flex;
    flex-flow: column;
    height: 100%;

    .tabs-component {
        display: flex;
        flex: 0 1 auto;
    }

    .tab-content-component {
        display: flex;
        flex: 1 1 0;
        flex-direction: column;
        min-height: 0;
        padding: 0.5rem 1rem;
        overflow-y: auto;
    }
}

.tabs-component {
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
                    
        &.tabs-active {
            cursor: default;
            color: $font-color;
        }

        &:not(.tabs-active) {
            background-color: $header-background;
            color: $font-color-inactive;
        }

        .tabs-icon {
            height: 1.2rem;
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
    }
}
</style>
