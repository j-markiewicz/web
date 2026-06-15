export default {
	development: {
		storage: "./transit-map.sqlite",
		dialect: "sqlite",
	},
	production: {
		url: process.env.DB,
		dialect: "postgres",
	},
};
