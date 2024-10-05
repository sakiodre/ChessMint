import { DefineComponent } from "vue";

export interface ITabData {
    id: string;
    title: string;
    icon: string;
    component: DefineComponent<{}, {}, any>;
}