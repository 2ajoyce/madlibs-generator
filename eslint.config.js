import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

import globals from 'globals'

export default [
    {
        files: ['src/*.ts', 'src/*.tsx'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: { modules: true },
                ecmaVersion: 'latest',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': ts,
            ts,
        },
        rules: {
            ...ts.configs['eslint-recommended'].rules,
            ...ts.configs['recommended'].rules,
            'ts/return-await': 2,
            '@typescript-eslint/no-explicit-any': 0,
        },
    },
]
