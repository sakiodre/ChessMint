const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        chessmint: ["./src/main.ts"],
        popup: ["./src/extension/popup/index.ts"],
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
                    appendTsSuffixTo: [/\.(vue)$/]
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.(txt|svg)$/i,
                type: 'asset/source',
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[hash][ext][query]'
                }
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            chunks: ["popup"],
            filename: "popup.html",
            template: path.resolve(__dirname, "src/extension/popup/index.html"),
            cache: true,
        })
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