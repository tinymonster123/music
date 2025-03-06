import connectDBSSH from "../connection/connection";
import { NextResponse } from "next/server";
import { DatabaseConnection } from "../pieData/route";

const GET = async () => {
  try {
    const { connection, conn } = (await connectDBSSH()) as DatabaseConnection;

    const [rows] = await connection.query(`
            SELECT album_listens, album_title  
            FROM raw_albums  
            ORDER BY album_listens;
        `);

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
