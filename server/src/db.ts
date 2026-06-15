import { Temporal } from "temporal-polyfill";
import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import system from "../models/system.js";
import user from "../models/user.js";
import gtfs_source from "../models/gtfs_source.js";
import rt_source from "../models/rt_source.js";
import user_token from "../models/user_token.js";

import { SystemConfig } from "./types.js";

export default abstract class DB {
	/** create a new DB using the given `uri` */
	static async new(uri: string): Promise<DB> {
		return SequelizeDB._new(
			new Sequelize(uri.toString(), { define: { timestamps: false } }),
		);
	}

	/** get the config for all systems in the database */
	public abstract get_config_all(): Promise<{
		[name in string]?: SystemConfig & { owner: string };
	}>;

	/** get the config for the given system */
	public abstract get_config(
		system: string,
	): Promise<(SystemConfig & { owner: string }) | undefined>;

	/** set the config for the given system to the given value, if it exists */
	public abstract set_config(
		system: string,
		config: SystemConfig,
	): Promise<undefined>;

	/** add a new system config, but only if it doesn't exist */
	public abstract add_config(
		system: string,
		email: string,
		config: SystemConfig,
	): Promise<undefined>;

	/** delete the config for the given system */
	public abstract delete_config(system: string): Promise<undefined>;

	/** get a user's information by their user token */
	public abstract get_user_by_user_token(
		token: string,
		new_expiry?: Temporal.Instant,
	): Promise<{ email: string; is_admin: boolean } | undefined>;

	/** set the given user token for the user with the given email address, returning whether such a user exists */
	public abstract set_user_token(
		email: string,
		user_token: string,
		expires: Temporal.Instant,
	): Promise<boolean>;

	/** delete the given user token from the database, returning whether it existed */
	public abstract delete_user_token(user_token: string): Promise<boolean>;

	/** get a user's information by their email address */
	public abstract get_user_by_email(email: string): Promise<
		| {
				provider: string | null;
				authenticator: string;
				totp_secret: string | null;
				is_admin: boolean;
		  }
		| undefined
	>;

	/** add a user account */
	public abstract add_user(
		email: string,
		provider: string | null,
		authenticator: string,
		totp_secret: string | null,
		is_admin?: boolean,
	): Promise<undefined>;
}

class SequelizeDB extends DB {
	private db: Sequelize;
	private System: ModelStatic<Model<any, any>>;
	private User: ModelStatic<Model<any, any>>;
	private GtfsSource: ModelStatic<Model<any, any>>;
	private RtSource: ModelStatic<Model<any, any>>;
	private UserToken: ModelStatic<Model<any, any>>;

	private constructor(db: Sequelize) {
		super();

		this.System = system(db, DataTypes);
		this.User = user(db, DataTypes);
		this.GtfsSource = gtfs_source(db, DataTypes);
		this.RtSource = rt_source(db, DataTypes);
		this.UserToken = user_token(db, DataTypes);
		this.db = db;
	}

	/** create a new SequelizeDB from the given `db` */
	static async _new(db: Sequelize): Promise<DB> {
		const self = new SequelizeDB(db);
		await self.db.authenticate();

		await self.expire_tokens();
		return self;
	}

	public async get_config_all(): Promise<{
		[name in string]?: SystemConfig & { owner: string };
	}> {
		const gtfs_sources = (await this.GtfsSource.findAll()).map((obj) =>
			obj.get(),
		);
		const rt_sources = (await this.RtSource.findAll()).map((obj) => obj.get());

		return Object.fromEntries(
			(await this.System.findAll())
				.map((obj) => obj.get())
				.map((sys) => [
					sys.name,
					{
						owner: sys.owner,
						location: [
							[sys.lat1, sys.lon1],
							[sys.lat2, sys.lon2],
						],
						gtfs: Object.fromEntries(
							gtfs_sources
								.filter((src) => src.system === sys.name)
								.map((s) => [s.url, { id: s.id, max_age: s.max_age }]),
						),
						realtime: Object.fromEntries(
							rt_sources
								.filter((src) => src.system === sys.name)
								.map((s) => [s.url, { id: s.id, max_age: s.max_age }]),
						),
					},
				]),
		);
	}

	public async get_config(
		system: string,
	): Promise<(SystemConfig & { owner: string }) | undefined> {
		const sys = (await this.System.findByPk(system))?.get();

		if (sys === null || sys === undefined) {
			return undefined;
		}

		const gtfs_sources = (
			await this.GtfsSource.findAll({ where: { system: sys.name } })
		).map((obj) => obj.get());
		const rt_sources = (
			await this.RtSource.findAll({ where: { system: sys.name } })
		).map((obj) => obj.get());

		return {
			owner: sys.owner,
			location: [
				[sys.lat1, sys.lon1],
				[sys.lat2, sys.lon2],
			],
			gtfs: Object.fromEntries(
				gtfs_sources.map((s) => [s.url, { id: s.id, max_age: s.max_age }]),
			),
			realtime: Object.fromEntries(
				rt_sources.map((s) => [s.url, { id: s.id, max_age: s.max_age }]),
			),
		};
	}

	public async set_config(
		system: string,
		config: SystemConfig,
	): Promise<undefined> {
		await this.db.transaction(async (transaction) => {
			const sys = await this.System.findByPk(system, { transaction });

			if (sys === null || sys === undefined) {
				return undefined;
			}

			sys.set("lat1", config.location[0][0]);
			sys.set("lon1", config.location[0][1]);
			sys.set("lat2", config.location[1][0]);
			sys.set("lon2", config.location[1][1]);
			await sys.save({ transaction });

			await this.GtfsSource.destroy({ where: { system }, transaction });
			await this.RtSource.destroy({ where: { system }, transaction });

			await this.GtfsSource.bulkCreate(
				Object.entries(config.gtfs).map(([url, c]) => ({
					system,
					url: url,
					id: c!.id,
					max_age: c!.max_age,
				})),
				{ transaction },
			);

			await this.RtSource.bulkCreate(
				Object.entries(config.realtime).map(([url, c]) => ({
					system,
					url: url,
					id: c!.id,
					max_age: c!.max_age,
				})),
				{ transaction },
			);
		});
	}

	public async add_config(
		system: string,
		owner: string,
		config: SystemConfig,
	): Promise<undefined> {
		await this.db.transaction(async (transaction) => {
			await this.System.create(
				{
					name: system,
					owner,
					lat1: config.location[0][0],
					lon1: config.location[0][1],
					lat2: config.location[1][0],
					lon2: config.location[1][1],
				},
				{ transaction },
			);

			await this.GtfsSource.bulkCreate(
				Object.entries(config.gtfs).map(([url, c]) => ({
					system,
					url: url,
					id: c!.id,
					max_age: c!.max_age,
				})),
				{ transaction },
			);

			await this.RtSource.bulkCreate(
				Object.entries(config.realtime).map(([url, c]) => ({
					system,
					url: url,
					id: c!.id,
					max_age: c!.max_age,
				})),
				{ transaction },
			);
		});
	}

	public async delete_config(system: string): Promise<undefined> {
		await this.db.transaction(async (transaction) => {
			await this.GtfsSource.destroy({ where: { system }, transaction });
			await this.RtSource.destroy({ where: { system }, transaction });
			await this.System.destroy({
				where: { name: system },
				transaction,
			});
		});
	}

	public async get_user_by_user_token(
		token: string,
		new_expiry?: Temporal.Instant,
	): Promise<{ email: string; is_admin: boolean } | undefined> {
		await this.expire_tokens();

		try {
			if (new_expiry !== undefined) {
				await (
					await this.UserToken.findByPk(token)
				)?.update({ expires: new_expiry.toString() });
			}
		} catch (e: unknown) {}

		const tok = (await this.UserToken.findByPk(token))?.get();

		if (tok === undefined || tok === null) {
			return undefined;
		}

		const res = (await this.User.findByPk(tok.user))?.get();

		if (res === undefined || res === null) {
			return undefined;
		}

		return { email: res.email, is_admin: !!res.is_admin };
	}

	public async get_user_by_email(email: string): Promise<
		| {
				provider: string | null;
				authenticator: string;
				totp_secret: string | null;
				is_admin: boolean;
		  }
		| undefined
	> {
		const res = (await this.User.findByPk(email))?.get();

		return res === undefined || res === null
			? undefined
			: {
					provider: res.provider,
					authenticator: res.authenticator,
					totp_secret: res.totp_secret,
					is_admin: !!res.is_admin,
				};
	}

	public async set_user_token(
		email: string,
		user_token: string,
		expires: Temporal.Instant,
	): Promise<boolean> {
		return await this.db.transaction(async (transaction) => {
			const user = (await this.User.findByPk(email, { transaction }))?.get();

			if (user === undefined || user === null) {
				return false;
			}

			await this.UserToken.create(
				{
					user: email,
					token: user_token,
					expires: expires.toString(),
				},
				{ transaction },
			);

			return true;
		});
	}

	public async delete_user_token(user_token: string): Promise<boolean> {
		return (await this.UserToken.destroy({ where: { token: user_token } })) > 0;
	}

	public async add_user(
		email: string,
		provider: string | null,
		authenticator: string,
		totp_secret: string | null,
		is_admin: boolean = false,
	): Promise<undefined> {
		await this.User.create({
			email,
			provider,
			authenticator,
			totp_secret,
			is_admin: is_admin ? 1 : 0,
		});
	}

	private async expire_tokens() {
		await this.db.transaction(async (transaction) => {
			for (const { token, expires } of (
				await this.UserToken.findAll({
					transaction,
				})
			).map((obj) => obj.get())) {
				if (
					Temporal.Instant.from(expires)
						.since(Temporal.Now.instant())
						.total("nanoseconds") < 0
				) {
					await this.UserToken.destroy({ where: { token }, transaction });
				}
			}
		});
	}
}
