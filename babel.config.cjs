// babel.config.cjs
module.exports = {
  sourceType: "unambiguous",
  presets: [['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs', sourceType: "unambiguous" }], '@babel/preset-react']
};