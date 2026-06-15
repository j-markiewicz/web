"use strict";

/** @type {import('sequelize-cli').Migration["up"]} */
export async function up(queryInterface, Sequelize) {
	await queryInterface.bulkInsert("Users", [
		{
			email: "admin@transit.map",
			provider: null,
			authenticator:
				"$argon2id$v=19$m=65536,t=10,p=4$MDEyMzQ1Njc4OQ$KMdDU1vSkD09HJqNUE+brw",
			totp_secret: null,
			is_admin: true,
		},
	]);

	await queryInterface.bulkInsert("Systems", [
		{
			name: "Kraków",
			owner: "admin@transit.map",
			lat1: 50.1233,
			lon1: 19.7575,
			lat2: 49.9628,
			lon2: 20.1764,
		},
		{
			name: "Koleje Małopolskie",
			owner: "admin@transit.map",
			lat1: 50.6,
			lon1: 21.5,
			lat2: 49.45,
			lon2: 19,
		},
	]);

	await queryInterface.bulkInsert("GtfsSources", [
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/GTFS_KRK_T.zip",
			id: "t",
			max_age: "1d",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/GTFS_KRK_A.zip",
			id: "a",
			max_age: "1d",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/GTFS_KRK_M.zip",
			id: "m",
			max_age: "1d",
		},
		{
			system: "Koleje Małopolskie",
			url: "https://kolejemalopolskie.com.pl/rozklady_jazdy/kml-ska-gtfs.zip",
			id: "ska",
			max_age: "1d",
		},
		{
			system: "Koleje Małopolskie",
			url: "https://kolejemalopolskie.com.pl/rozklady_jazdy/ald-gtfs.zip",
			id: "bus",
			max_age: "1d",
		},
	]);

	await queryInterface.bulkInsert("RtSources", [
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/VehiclePositions_T.pb",
			id: "t",
			max_age: "20s",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/VehiclePositions_A.pb",
			id: "a",
			max_age: "20s",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/VehiclePositions_M.pb",
			id: "m",
			max_age: "20s",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/TripUpdates_T.pb",
			id: "t",
			max_age: "20s",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/TripUpdates_A.pb",
			id: "a",
			max_age: "20s",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/TripUpdates_M.pb",
			id: "m",
			max_age: "20s",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/ServiceAlerts_T.pb",
			id: "t",
			max_age: "5m",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/ServiceAlerts_A.pb",
			id: "a",
			max_age: "5m",
		},
		{
			system: "Kraków",
			url: "https://gtfs.ztp.krakow.pl/ServiceAlerts_M.pb",
			id: "m",
			max_age: "5m",
		},
	]);
}

/** @type {import('sequelize-cli').Migration["down"]} */
export async function down(queryInterface, Sequelize) {
	await queryInterface.bulkDelete("RtSources", [], {});
	await queryInterface.bulkDelete("GtfsSources", [], {});
	await queryInterface.bulkDelete("Systems", [], {});
	await queryInterface.bulkDelete("Users", [], {});
}
