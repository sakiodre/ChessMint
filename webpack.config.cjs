const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
    mode: "production",
    entry: {
        chessmint: ["./src/internal/main.ts"],
        loader: ["./src/content-scripts/loader.ts"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [{ from: "./public" }],
        }),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "vue": "vue/dist/vue.esm-browser.prod.js",
            "@": path.resolve(__dirname, "src/internal")
        }
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
};