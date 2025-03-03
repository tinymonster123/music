import connectDBSSH from "../connection/connection";
import { NextResponse } from "next/server";

interface DatabaseConnection {
  connection: any;
  conn: any;
}

const GET = async () => {
  try {
    const { connection, conn } = (await connectDBSSH()) as DatabaseConnection;

    const [rows] = await connection.query(`
            SELECT album_id, album_date_created  
            FROM raw_albums  
            ORDER BY album_id;
        `);

    await connection.end();
    conn.end();

    return NextResponse.json(
      {
        success: true,
        data: rows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        data: "Error",
      },
      { status: 500 }
    );
  }
};

export { GET };
