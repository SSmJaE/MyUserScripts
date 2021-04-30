import fs from "fs";
import path from "path";

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack, { Configuration } from "webpack";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

import PACKAGE_JSON from "./package.json";

const config: Configuration = {
    mode: "production",
    optimization: {
        minimize: false,
    },
    entry: "./src/main.ts",
    output: {
        //__dirname即当前文件所在目录的路径，此处是根目录
        path: path.resolve(__dirname, "./dist"),
        filename: `YouTubeRatio${PACKAGE_JSON.version}.user.js`,
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: "babel-loader",
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    // "babel-loader",
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            // importLoaders: 1,
                        },
                    },
                    // "postcss-loader",
                ],
            },
            {
                test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/i,
                use: [
                    {
                        loader: "url-loader",
                        // options: {
                        //     limit: 8192,
                        // },
                    },
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        new webpack.BannerPlugin({
            banner: fs.readFileSync("./headers.js", "utf8"),
            raw: true,
            entryOnly: true,
        }),
        new webpack.EnvironmentPlugin({}),
        new ForkTsCheckerWebpackPlugin(),
    ],
    resolve: {
        //import的时候，可以不用写扩展名
        extensions: [".ts", ".js", ".vue", ".json"],
        alias: {
            "@src": path.resolve(__dirname, "./src/"),
        },
    },
};

export default config;
