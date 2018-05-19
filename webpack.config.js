const ExtractTextWebPackPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: './src/main.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css/,
                use: ExtractTextWebPackPlugin.extract({
                        use: "css-loader",
                        fallback: "style-loader"
                    })
            }]
    },
    plugins: [
        new ExtractTextWebPackPlugin("style.css")
    ]
};