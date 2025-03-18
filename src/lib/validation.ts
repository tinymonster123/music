import { z } from "zod";

const loginSchema = z.object({
  password: z
    .string()
    .min(6, { message: "最短密码长度为 6" })
    .max(100, { message: "最长密码长度为 100" }),
  email: z.string().email("请输入有效邮箱地址"),
});

const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入密码不同",
    path: ["confirmPassword"],
  });

// 导出 logininput 和 registerinput 的数据结构
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export { loginSchema, registerSchema };
