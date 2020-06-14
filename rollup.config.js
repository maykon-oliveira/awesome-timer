import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';
import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import path from 'path';

export default [
    {
        input: 'src/index.ts',
        output: {
            file: path.resolve(__dirname, 'dist/index.js'),
            format: 'cjs',
            sourcemap: true,
        },
        plugins: [
            resolve(),
            commonjs(),
            minify({ comments: false }),
            babel({
                exclude: 'node_modules/**',
            }),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        module: 'es2015',
                        declarationDir: path.resolve(__dirname, './typings'),
                        declarationMap: true,
                    },
                },
                rollupCommonJSResolveHack: true,
                useTsconfigDeclarationDir: true,
            }),
        ],
    },
];
