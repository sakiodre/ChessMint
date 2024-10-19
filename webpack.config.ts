import path from "path";
import WebSocket from "ws";
import CopyPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import {
    Compiler,
    Configuration,
    EntryObject,
    RuleSetRule,
    WebpackPluginInstance,
} from "webpack";
import * as crypto from "node:crypto";

// This plugin open a websocket on port 48152, the extension running
// in the browser connects to it, whenever webpack triggers a build
// the server will send "reload" command to the extension's service
// worker, it then reloads itself and refresh the pages.
class ChromeExtensionReloader implements WebpackPluginInstance {
    private readonly wss: WebSocket.Server;

    constructor() {
        this.wss = new WebSocket.Server({ port: 48152 });
    }

    apply(compiler: Compiler) {
        compiler.hooks.done.tap("WebSocketReloadPlugin", (stats) => {
            if (!stats.hasErrors()) {
                console.log("\x1b[36mreloading chrome extension\x1b[0m");
                this.wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send("reload");
                    }
                });
            }
        });
    }
}

function modifyManifest(input: Buffer) {
    var manifest = JSON.parse(input.toString());

    manifest.background = {
        service_worker: "service-worker.js",
    };

    return JSON.stringify(manifest, null, 4);
}

export default (env: { [index: string]: boolean }) => {
    const isDevelopment = env.development === true;

    const entries: EntryObject = {
        chessmint: "./src/main.ts",
        popup: "./src/extension/popup/index.ts",
        "content-script": "./src/extension/content-script.ts",
    };

    const ruleTypeScript: RuleSetRule = {
        test: /\.tsx?$/i,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [
            {
                loader: "ts-loader",
                options: {
                    appendTsSuffixTo: [/\.(vue)$/],
                },
            },
            {
                loader: "ifdef-loader",
                options: {
                    DEVELOPMENT: isDevelopment,
                },
            },
        ],
    };

    const ruleSCSS: RuleSetRule = {
        test: /\.s?[ac]ss$/i,
        oneOf: [
            // this matches `<style module>`
            {
                resourceQuery: /module/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            // because our extension runs before the dom is loaded
                            // we need style-loader to insert <style>'s into documentElement
                            // instead of head
                            insert: "html",
                        },
                    },
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                // i spent 3 hours googling for this one liner
                                namedExport: false,
                                localIdentName: isDevelopment
                                    ? "[local]_[hash:base64:2]"
                                    : "[hash:base64:8]",
                                localIdentHashSalt: crypto
                                    .randomBytes(20)
                                    .toString("hex"),
                            },
                        },
                    },
                    "sass-loader",
                ],
            },
            {
                use: ["style-loader", "css-loader", "sass-loader"],
            },
        ],
    };

    const plugins: WebpackPluginInstance[] = [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            chunks: ["popup"],
            filename: "popup.html",
            template: path.resolve(__dirname, "src/extension/popup/index.html"),
            cache: true,
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "public"),
                    transform: {
                        cache: true,
                        transformer(input: Buffer, absoluteFilename: string) {
                            if (!isDevelopment) {
                                return input;
                            }

                            const fileName = path.basename(absoluteFilename);
                            if (fileName !== "manifest.json") {
                                return input;
                            }
                            return modifyManifest(input);
                        },
                    },
                },
            ],
        }),
    ];

    if (isDevelopment) {
        // we only need the service worker for development, its only purpose
        // is to listen to ChromeExtensionReloader's websocket and reload the extension
        entries["service-worker"] = ["./src/extension/service-worker.ts"];
        plugins.push(new ChromeExtensionReloader());
    }

    const config: Configuration = {
        mode: isDevelopment ? "development" : "production",
        entry: entries,
        watch: isDevelopment,
        devtool: isDevelopment ? "inline-source-map" : false,
        module: {
            rules: [
                ruleTypeScript,
                ruleSCSS,
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                },
                {
                    test: /\.(txt|svg)$/i,
                    type: "asset/source",
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: "img/[hash][ext][query]",
                    },
                },
            ],
        },
        plugins: plugins,
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
            alias: {
                vue: isDevelopment
                    ? "vue/dist/vue.esm-bundler.js"
                    : "vue/dist/vue.esm-browser.prod.js",
                "@": path.resolve(__dirname, "src"),
            },
        },
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, "dist"),
        },
    };

    return config;
};
