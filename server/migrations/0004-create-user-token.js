"use strict";

import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration["up"]} */
export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("UserTokens", {
		token: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		user: {
			type: DataTypes.TEXT,
			allowNull: false,
			references: { model: "Users", key: "email" },
			onDelete: "CASCADE",
			onUpdate: "CASCADE",
		},
		expires: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	});
}

/** @type {import('sequelize-cli').Migration["down"]} */
export async function down(queryInterface, Sequelize) {
	await queryInterface.dropTable("UserTokens");
}
