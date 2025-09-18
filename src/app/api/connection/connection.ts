import { Client } from "ssh2";
import mysql from "mysql2/promise";
import fs from "fs";

const forwardPort = 3306;

let pool: mysql.Pool | null = null;
let sshClient: Client | null = null;
let lastConnectTime: number = 0;
const CONNECTION_TIMEOUT = 10 * 1000 * 60 * 3;

const connectDBSSH = async () => {
	const currentTime = Date.now();
	if (pool && sshClient && currentTime - lastConnectTime < CONNECTION_TIMEOUT) {
		lastConnectTime = currentTime;
		return { connection: pool, conn: sshClient };
	}

	// 关闭可能存在的旧连接
	if (pool) {
		try {
			await pool.end();
		} catch (error) {
			console.error("Error closing pool:", error);
		}
		pool = null;
	}

	if (sshClient) {
		try {
			sshClient.end();
		} catch (error) {
			console.error("Error closing SSH client:", error);
		}
		sshClient = null;
	}

	if (
		process.env.NODE_ENV === "production" &&
		process.env.DB_DIRECT_CONNECTION === "true"
	) {
		console.log("生产环境：使用直接数据库连接");

		const dbConfig = {
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: parseInt(process.env.DB_PORT || "3306", 10),
			queueLimit: 0,
			waitForConnections: true,
			connectionLimit: 10,
			enableKeepAlive: true,
			acquireTimeout: 60000,
			timeout: 60000,
		};

		try {
			pool = mysql.createPool(dbConfig);
			// 测试连接
			await pool.execute("SELECT 1");
			lastConnectTime = Date.now();
			return { connection: pool, conn: null };
		} catch (error) {
			console.error("生产环境数据库连接失败:", error);
			throw new Error("生产环境数据库连接失败");
		}
	}

	// 开发环境或需要SSH隧道的环境
	console.log("使用SSH隧道连接数据库");

	let privateKey: string;
	try {
		privateKey = fs.readFileSync(process.env.SSH_KEY_PATH || "", "utf8");
	} catch (error) {
		console.error("Failed to read SSH key:", error);
		throw new Error("SSH key could not be loaded");
	}

	const sshConfig = {
		username: process.env.SSH_USER || "",
		host: process.env.SSH_HOST || "",
		privateKey: privateKey,
		readyTimeout: 5000,
	};

	const dbConfig = {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		queueLimit: 0,
		waitForConnections: true,
		connectionLimit: 10,
		enableKeepAlive: true,
	};

	return new Promise((resolve, reject) => {
		const conn = new Client();
		conn
			.on("ready", () => {
				conn.forwardOut(
					"127.0.0.1",
					33306,
					"127.0.0.1",
					forwardPort,
					async (error, stream) => {
						if (error) {
							reject(error);
							return;
						}

						try {
							const newPool = await mysql.createPool({
								...dbConfig,
								stream: stream,
							});

							// (await pool).ping();
							pool = newPool; // 更新全局 Pool
							sshClient = conn;

							lastConnectTime = Date.now();
							resolve({ connection: pool, conn });
						} catch (dbError) {
							conn.end();
							reject(dbError);
						}
					},
				);
			})
			.on("error", (error) => reject(error))
			.connect(sshConfig);
	});
};

export default connectDBSSH;
