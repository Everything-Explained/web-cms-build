module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.ts*'
    ],

    tests: ['__tests__/**/*test.ts*'],

    compilers: {
      '**/*.ts?(x)': wallaby.compilers.typeScript({
        module: 'commonjs',
      })
    },
  };
};