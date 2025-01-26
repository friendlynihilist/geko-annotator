module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current', // Adjusts for the current Node.js version
        },
      },
    ],
    '@babel/preset-react', // Enables React JSX transformation
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining', // Enables optional chaining (?.)
    '@babel/plugin-proposal-nullish-coalescing-operator', // Enables nullish coalescing (??)
  ],
};

