import connectDBSSH from "../connection/connection";
import { NextResponse } from "next/server";
import { DatabaseConnection } from "../pieData/route";

// 生成一致的 Last-Modified 头
const generateLastModified = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toUTCString();
};

const GET = async (request: Request) => {
  // 检查客户端缓存
  const ifModifiedSince = request.headers.get("if-modified-since");
  const lastModified = generateLastModified();

  if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
    // 数据未修改，返回 304 状态码
    return new NextResponse(null, {
      status: 304,
      headers: {
        "Last-Modified": lastModified,
        "Cache-Control":
          "max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }
  try {
    const { connection, conn } = (await connectDBSSH()) as DatabaseConnection;

    const [rows] = await connection.query(`
            SELECT album_date_created, album_id 
            FROM raw_albums  
            ORDER BY album_id
            LIMIT 1000;
        `);

    return NextResponse.json(
      {
        success: true,
        data: rows,
      },
      {
        status: 200,
        headers: {
          "Last-Modified": lastModified,
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
