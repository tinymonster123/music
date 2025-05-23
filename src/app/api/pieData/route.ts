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
  
  let connection;
  let conn;
  
  try {
    console.log("开始获取数据库连接...");
    ({ connection, conn } = (await connectDBSSH()) as DatabaseConnection);
    console.log("数据库连接成功");
    
    // 1. 首先查询总记录数
    console.log("执行总记录数统计查询...");
    const [countResult] = await connection.query(`
      SELECT COUNT(*) as total FROM raw_albums;
    `);
    
    const totalCount = countResult[0]?.total || 0;
    console.log(`数据库中的总记录数: ${totalCount}`);
    
    // 2. 尝试获取所有专辑，但增加最大限制以防止潜在问题
    console.log("执行全量专辑列表查询...");
    const [rows] = await connection.query(`
      SELECT album_listens, album_title  
      FROM raw_albums  
      ORDER BY album_listens DESC
      LIMIT 500000;
    `);

    console.log(`查询返回的记录数: ${rows.length}`);
    if (rows.length > 0) {
      console.log("最高播放量专辑:", rows[0]);
      console.log("最低播放量专辑:", rows[rows.length - 1]);
    }

    return NextResponse.json(
      {
        success: true,
        data: rows,
        debug: {
          totalRecordsInDb: totalCount,
          returnedRecords: rows.length,
          queryType: "完整查询"
        }
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
    console.error("获取专辑数据时出错:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        data: "Error",
      },
      { status: 500 }
    );
  } finally {
    // 确保连接总是被关闭
    try {
      if (connection) {
        console.log("关闭数据库连接...");
        await connection.end();
      }
      if (conn) {
        console.log("关闭SSH连接...");
        conn.end();
      }
    } catch (closeError) {
      console.error("关闭连接时出错:", closeError);
    }
  }
};

export { GET };
