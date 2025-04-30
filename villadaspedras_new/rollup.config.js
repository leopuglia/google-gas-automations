import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
// import terser from '@rollup/plugin-terser';

/** Plugin para remover todas as linhas de import estático */
function removeImports() {
  return {
    name: 'remove-imports',
    renderChunk(code) {
      // Regex que captura linhas com `import ... from '...'` ou `import '...'`;
      const stripped = code
        .split('\n')
        .filter(line => !/^import\s.*?;/.test(line))
        .filter(line => !/^export\s.*?;/.test(line))
        .join('\n');
      return { code: stripped, map: null };
    }
  };
}

export default [
  /*
  input: 'src/main.ts',
  // input: {
  //   main: 'src/main.ts',
  //   utils: 'src/utils.ts'
  // },
  // input: ['src/main.ts', 'src/utils.ts'],
  output: {
    // file: 'build/villadaspedras.js',
    dir: 'build',
    // format: 'iife',
    // format: 'umd',
    format: 'esm',
    // format: 'es',
    // format: 'cjs',
    // manualChunks: {
    //   utils: 'src/utils.ts'
    // },
    // inlineDynamicImports: true,
    inlineDynamicImports: false,
    // exports: 'default',
    name: 'VillaDasPedras'
  },
  // external: ['utils'],
  // external: ['src/utils.ts'],
  external: ['utils', 'luxon'],
  // external: ['luxon'],
  plugins: [
    nodeResolve(),
    // commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    // terser()
  ]
  */
  {
    // input: {
    //   salarios: 'src/salarios/main.ts'
    // },
    input: {
      salarios: 'src/salarios/main.ts',
      utils: 'src/utils.ts'
    },
    output: {
      dir: 'build/salarios',
      format: 'esm',
      // inlineDynamicImports: true,
      inlineDynamicImports: false,
      name: 'VilladasPedras.Salarios'
    },
    // external: ['utils', 'luxon'],
    external: ['luxon'],
    plugins: [
      nodeResolve(),
      // commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'build/salarios'
      }),
      removeImports(),
      // terser(),
    ]
  }
];
