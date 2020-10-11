import * as webpack from "webpack";
import copWebpackPlugin from 'copy-webpack-plugin'; // ファイルをコピーするplugin

// *.tsをts-loaderでトランスパイルする
const rules: webpack.RuleSetRule[] = [
    {
        test: /.ts$/,
        use: 'ts-loader',
        exclude: '/node_modules/'
    }
]

const module_setting: webpack.Module = {
    rules: rules
};

const config: webpack.Configuration = {
    entry: `${__dirname}/src/content_scripts.ts`,
    output: {
        //path: path.join(__dirname, 'dist'),
        // 省略すると`${__dirname}/dist`に出力される
    },
    module: module_setting,
    // import文で末尾の.tsを省略して書けるようにする
    resolve: {
        extensions: ['ts', 'js']
    },
    plugins: [
        new copWebpackPlugin([
            {from: 'public', to: '.'}
        ])
    ]
};

export default config
