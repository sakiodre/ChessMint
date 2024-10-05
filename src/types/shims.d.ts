declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}
declare module "*.svg" {
    export default "";
}

declare module "*.txt" {
    export default "";
}
