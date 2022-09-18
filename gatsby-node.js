const webpack = require("webpack");

exports.onCreateWebpackConfig = ({ getConfig, actions }) => {
    actions.setWebpackConfig({
        devtool: false,
        plugins: [
            new webpack.ProvidePlugin({
                Buffer: [require.resolve("buffer/"), "Buffer"],
            }),
        ],
        resolve: {
            fallback: {
                crypto: false,
                stream: false,
                assert: false,
                util: false,
                http: false,
                https: false,
                url: false,
                os: false,
                fs: false,
                path: false,
                electron: false,
            },
        },
    });
};
