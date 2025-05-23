import connectDBSSH from "../connection/connection";
import { NextResponse } from "next/server";

export interface DatabaseConnection {
  connection: any;
  conn: any;
}

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

    // 先查询总记录数
    const [countResult] = await connection.query(`
        SELECT COUNT(*) as total FROM raw_albums;
    `);
    
    const totalCount = countResult[0]?.total || 0;
    console.log('Total records in database:', totalCount);

    // 查询数据，按播放量降序排列
    const [rows] = await connection.query(`
        SELECT album_listens, album_title  
        FROM raw_albums  
        ORDER BY album_listens DESC
        LIMIT 10000;
    `);

    console.log('Records returned by query:', rows.length);
    console.log('Sample data:', rows.slice(0, 3));

    try {
        // 安全关闭连接
        if (connection) await connection.end();
        if (conn) conn.end();
    } catch (closeError) {
        console.error('Error closing connections:', closeError);
    }

    return NextResponse.json(
      {
        success: true,
        data: rows,
        totalRecords: totalCount,
        returnedRecords: rows.length
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
