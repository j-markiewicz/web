"use strict";

/** @type {(sequelize: import("sequelize").Sequelize, DataTypes: import("sequelize").DataTypes) => import("sequelize").ModelStatic<import("sequelize").Model<any, unknown>>} */
export default (sequelize, DataTypes) => {
	return sequelize.define("RtSource", {
		system: {
			type: DataTypes.TEXT,
			allowNull: false,
			references: { model: sequelize.models.System },
			onDelete: "CASCADE",
			primaryKey: true,
		},
		url: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		id: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		max_age: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	});
};
