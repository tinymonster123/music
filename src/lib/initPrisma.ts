import initDataBase from "@/app/api/prisma/initdatabase";

const initPrisma = async () => {
  await initDataBase();
};

export default initPrisma;
