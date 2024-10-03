const path = require("path");
const config = require("./webpack.config.cjs");
const { merge } = require("webpack-merge");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = merge(config, {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                loader: "ifdef-loader",
                options: {
                    DEBUG: false,
                }
            },
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: "./public" }],
        }),
    ],
});