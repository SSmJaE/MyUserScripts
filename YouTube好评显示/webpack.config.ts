import fs from "fs";
import path from "path";

import webpack, { Configuration } from "webpack";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

import PACKAGE_JSON from "./package.json";

const config: Configuration = {
    optimization: {
        minimize: false,
    },
    entry: "./src/main.ts",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: `YouTubeRatio-${PACKAGE_JSON.version}.user.js`,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        new webpack.BannerPlugin({
            banner: fs.readFileSync("./header.js", "utf8"),
            raw: true,
            entryOnly: true,
        }),
        new ForkTsCheckerWebpackPlugin(),
    ],
    devtool: "nosources-source-map",
};

export default config;
