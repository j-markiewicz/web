"use strict";

import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration["up"]} */
export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("Users", {
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
}

/** @type {import('sequelize-cli').Migration["down"]} */
export async function down(queryInterface, Sequelize) {
	await queryInterface.dropTable("Users");
}
