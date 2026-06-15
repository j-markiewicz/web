"use strict";

/** @type {(sequelize: import("sequelize").Sequelize, DataTypes: import("sequelize").DataTypes) => import("sequelize").ModelStatic<import("sequelize").Model<any, unknown>>} */
export default (sequelize, DataTypes) => {
	return sequelize.define("UserToken", {
		token: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		user: {
			type: DataTypes.TEXT,
			allowNull: false,
			references: { model: sequelize.models.User },
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		},
		expires: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	});
};
