const path = require('path');

module.exports = {
    mode: 'development',
    devtool: "eval-cheap-module-source-map",
    entry: {
        participant_create: './demo/participant-create.js',
        initiator_redeem: './demo/initiator-redeem.js'
    },
    target: 'web',
    node: {
        fs: 'empty'
    },
    devServer: {
        host: '0.0.0.0',
        contentBase: path.join(__dirname, 'demo'),
        proxy: {
            '/': {
                target: 'http://localhost:19898',
                bypass: function (req, res, proxyOptions) {
                    console.log(req.path.toString());
                    if (req.headers.accept.indexOf('html') !== -1 ||
                        req.path.toString().endsWith('.js') ||
                        req.path.toString().endsWith('.gif')
                    ) {
                        console.log('Skipping proxy for browser request.');
                        return req.path;
                    }
                },
            },
        }
    }
};