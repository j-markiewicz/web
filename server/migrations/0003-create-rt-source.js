"use strict";

import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration["up"]} */
export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("RtSources", {
		system: {
			type: DataTypes.TEXT,
			allowNull: false,
			references: { model: "Systems", key: "name" },
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
}

/** @type {import('sequelize-cli').Migration["down"]} */
export async function down(queryInterface, Sequelize) {
	await queryInterface.dropTable("RtSources");
}
