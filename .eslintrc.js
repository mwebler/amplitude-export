module.exports = {
	extends: ['airbnb-base'],
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
		]
	}
};
