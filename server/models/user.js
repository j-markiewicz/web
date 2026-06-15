"use strict";

/** @type {(sequelize: import("sequelize").Sequelize, DataTypes: import("sequelize").DataTypes) => import("sequelize").ModelStatic<import("sequelize").Model<any, unknown>>} */
export default (sequelize, DataTypes) => {
	return sequelize.define("User", {
		email: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		provider: {
			type: DataTypes.TEXT,
		},
		authenticator: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		totp_secret: {
			type: DataTypes.TEXT,
		},
		is_admin: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	});
};
