module.exports = {
	plugins: [
        'promise'
    ],
	extends: ['airbnb-base', 'plugin:promise/recommended'],
	env: {
		node: true
	},
	rules: {
		'comma-dangle': [
			'error',
			{
				arrays: 'never',
				objects: 'never',
				functions: 'never',
			},
		],
		// 'promise/no-nesting': 'off',
		'promise/avoid-new': 'off',
	}
};
