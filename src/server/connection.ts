import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv";

export async function connectSingleStore(
  config: Partial<mysql.ConnectionOptions> = {}
) {
  dotenv.config();

  const baseConfig: mysql.ConnectionOptions = {
    host: process.env.HOST,
    port: Number(process.env.PORT),

    password: process.env.PASSWORD,
    user: "admin",
    database: process.env.DATABASE
  };

  return await mysql.createConnection({
    ...baseConfig,
    ...config,
  });
}

export async function stopSingleStore(conn: mysql.Connection) {
  await conn.end();
}

export async function readData({
  conn,
  database,
  embedding,
}: {
  conn?: mysql.Connection;
  database: string;
  embedding: any;
}) {
  try {
    let closeConn = false;
    if (!conn) {
      conn = await connectSingleStore({ database });
      closeConn = true;
    }
    const [rows] = await conn.execute(
      `SELECT title,DOT_PRODUCT(embedding, JSON_ARRAY_PACK('[${embedding}]')) AS similarity FROM items ORDER BY similarity DESC LIMIT 1 `
    );
    if (closeConn) {
      await stopSingleStore(conn);
    }
    console.log(rows[0].title);
    return rows[0].title;
  } catch (err) {
    console.error(err);
    return err;
  }
}

// export async function writeData({
//     conn,
//     database,
//     title,
//     embedding,
// }: {
//     conn?: mysql.Connection;
//     database: string;
//     title: string;
//     embedding: any;
// }) {
//     try {
//         let closeConn = false;
//         if (!conn) {
//             conn = await connectSingleStore({ database });
//             closeConn = true;
//         }
//         await conn.execute(
//             `INSERT INTO products (title, embedding) VALUES (?, DOT_PRODUCT(embedding, JSON_ARRAY_PACK('[${embedding}]')))`,
//             [title]
//         );
//         if (closeConn) {
//             await stopSingleStore(conn);
//         }
//     } catch (err) {
//         console.error(err);
//     }
// }
