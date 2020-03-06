const path = require('path');


module.exports = {
	entry: './src/Calculator.ts',
	mode: 'production',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'tax-calculator.js',
		library: 'TaxCalculator',
		libraryTarget: 'umd',
		globalObject: "this",
    umdNamedDefine: true
	},
	resolve: {
		extensions: [ '.ts', '.json', '.js' ]
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [['@babel/preset-env',
								{
									"targets": {
										"chrome": "58",
										"ie": "11"
									}
								}
							]],
							plugins: ['@babel/plugin-transform-object-assign']
						}
					},
					{
						loader: 'ts-loader'
					}
				]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
							plugins: ['@babel/plugin-transform-object-assign']
						}
					}
				]
			}
		]
	}
};
