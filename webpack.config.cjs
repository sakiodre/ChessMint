const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
    entry: {
        chessmint: ["./src/main.ts"],
        "content-script": ["./src/extension/content-script.ts"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.(txt|svg)$/i,
                type: 'asset/source',
            }
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "vue": "vue/dist/vue.esm-browser.prod.js",
            "@": path.resolve(__dirname, "src")
        }
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
};