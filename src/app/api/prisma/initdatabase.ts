import PrimsaStart from "./prisma";

const initDataBase = async () => {
  try {
    const localPort = 3307;
    await PrimsaStart(localPort);
    console.log("连接成功");
    return true;
  } catch (err) {
    console.error("连接错误", err);
    return false;
  }
};

export default initDataBase;
