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
  {
    input: {
      example: 'src/example/main.ts',
      utils: 'src/commons/utils.ts'
    },
    output: {
      dir: 'build/example',
      format: 'esm',
      inlineDynamicImports: false,
      name: 'VilladasPedras.Example'
    },
    // external: ['utils', 'luxon'],
    // external: ['luxon'],
    plugins: [
      nodeResolve(),
      // commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'build/example'
      }),
      removeImports(),
      // terser(),
    ]
  },
  {
    input: {
      salario: 'src/planilha-salario/main.ts',
      utils: 'src/commons/utils.ts'
    },
    output: {
      dir: 'build/salario',
      format: 'esm',
      inlineDynamicImports: false,
      name: 'VilladasPedras.Salarios'
    },
    // external: ['utils', 'luxon'],
    // external: ['luxon'],
    plugins: [
      nodeResolve(),
      // commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'build/salario'
      }),
      removeImports(),
      // terser(),
    ]
  },
  {
    input: {
      consumo: 'src/planilha-consumo/main.ts',
      utils: 'src/commons/utils.ts'
    },
    output: {
      dir: 'build/consumo',
      format: 'esm',
      inlineDynamicImports: false,
      name: 'VilladasPedras.Consumo'
    },
    // external: ['utils', 'luxon'],
    // external: ['luxon'],
    plugins: [
      nodeResolve(),
      // commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'build/consumo'
      }),
      removeImports(),
      // terser(),
    ]
  }
];
