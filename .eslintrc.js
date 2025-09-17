module.exports = {
	root: true,
	env: {
		node: true,
		es2022: true,
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		'prettier/prettier': 'error',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'warn',
		'no-console': 'off',
	},
	ignorePatterns: [
		'node_modules/',
		'dist/',
		'build/',
		'coverage/',
		'*.min.js',
		'*.bundle.js',
		'frontend/build/',
		'backend/data/',
		'backend/data_backups/',
		'*.log',
	],
	overrides: [
		// Frontend React/TypeScript specific rules
		{
			files: ['frontend/src/**/*.{ts,tsx}'],
			env: {
				browser: true,
				es2022: true,
			},
			extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			rules: {
				'react/react-in-jsx-scope': 'off', // Not needed in React 17+
				'react/prop-types': 'off', // Using TypeScript instead
				'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			},
		},
		// Backend Node.js specific rules
		{
			files: ['backend/**/*.js'],
			env: {
				node: true,
				es2022: true,
			},
			parserOptions: {
				sourceType: 'module',
			},
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
	],
};
