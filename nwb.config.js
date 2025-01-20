const path = require('path');

module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'MiradorAnnotation',
      externals: {
        react: 'React',
      },
    },
  },
  webpack: {
    aliases: {
      '@material-ui/core': path.resolve('./', 'node_modules', '@material-ui/core'),
      '@material-ui/styles': path.resolve('./', 'node_modules', '@material-ui/styles'),
      react: path.resolve('./', 'node_modules', 'react'),
      'react-dom': path.resolve('./', 'node_modules', 'react-dom'),
    },
    extra: {
      module: {
        rules: [
          {
            test: /\.js$/,
            include: [
              path.resolve('src'),
              path.resolve('node_modules/@recogito'),
              path.resolve('node_modules/@annotorious'),
            ],
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: [
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator',
              ],
            },
          },
        ],
      },
    },
  },
};
