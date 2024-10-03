const path = require("path");
const config = require("./webpack.config.cjs");
const { merge } = require("webpack-merge");
const WebSocket = require('ws');
const CopyPlugin = require("copy-webpack-plugin");

class ChromeExtensionReloader {
    constructor() {
        this.devServer = new WebSocket.Server({ port: 48152 });
    }
    apply(compiler) {
        compiler.hooks.done.tap('WebSocketReloadPlugin', (stats) => {
            console.log('reloading chrome extension');
            this.devServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send("reload");
                }
            });
        });
    }
}

function modifyManifest(content) {
    var manifest = JSON.parse(content.toString());

    manifest.background = {
        service_worker: "background.js"
    }

    return JSON.stringify(manifest, null, 2);
}

module.exports = merge(config, {
    mode: "development",
    devtool: "inline-source-map",
    watch: true,
    entry: {
        background: ["./src/background.ts"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                loader: "ifdef-loader",
                options: {
                    DEBUG: true,
                }
            },
        ]
    },
    resolve: {
        alias: {
            "vue": "vue/dist/vue.esm-bundler.js",
        }
    },
    plugins: [
        new ChromeExtensionReloader(),
        new CopyPlugin({
            patterns: [{
                from: "./public",
                transform(content, filePath) {
                    const fileName = path.basename(filePath);
                    if (fileName !== "manifest.json") {
                        return content;
                    }
                    return modifyManifest(content);
                },
            }],
        }),
    ]
});
