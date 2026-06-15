"use strict";

import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration["up"]} */
export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("Systems", {
		name: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		owner: {
			type: DataTypes.TEXT,
			allowNull: false,
			references: { model: "Users", key: "email" },
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
}

/** @type {import('sequelize-cli').Migration["down"]} */
export async function down(queryInterface, Sequelize) {
	await queryInterface.dropTable("Systems");
}
