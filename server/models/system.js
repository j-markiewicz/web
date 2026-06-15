"use strict";

/** @type {(sequelize: import("sequelize").Sequelize, DataTypes: import("sequelize").DataTypes) => import("sequelize").ModelStatic<import("sequelize").Model<any, unknown>>} */
export default (sequelize, DataTypes) => {
	return sequelize.define("System", {
		name: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		owner: {
			type: DataTypes.TEXT,
			allowNull: false,
			references: { model: sequelize.models.User },
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		},
		lat1: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		lon1: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		lat2: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		lon2: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
	});
};
