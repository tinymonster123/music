"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomRef } from "@/app/hooks/emailandpassword";
import useEmailAndPasswordStore from "@/app/hooks/emailandpassword";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import axios from "axios";
import { registerSchema } from "@/lib/validation";

const SignUpForm: React.FC<CustomRef> = ({
  className,
  emailRef,
  passwordRef,
  ...props
}) => {
  const { setEmailRef, setPasswordRef } = useEmailAndPasswordStore();
  const confirmRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<boolean>(false); // 修改为默认 false
  const [errorMessage, setErrorMessage] = useState<string>(""); // 添加错误消息状态
  const [ifRequired, setRequired] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false); // 添加加载状态
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (emailRef) setEmailRef(emailRef);
    if (!error && passwordRef) setPasswordRef(passwordRef);
  }, [emailRef, passwordRef, error, setEmailRef, setPasswordRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id === "email"
        ? "email"
        : id === "password"
        ? "password"
        : "confirmPassword"]: value,
    }));
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    setErrorMessage("");
    setIsLoading(true); // 设置加载状态

    console.log("表单提交开始..."); // 调试日志

    const { email, password, confirmPassword } = formValues;

    console.log("表单值:", { email, password, confirmPassword }); // 调试日志

    try {
      // 使用 Zod 验证
      const validationResult = registerSchema.safeParse({
        email,
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        // 处理验证错误
        const formattedErrors = validationResult.error.format();
        console.log("验证失败:", formattedErrors); // 调试日志

        // 提取第一个错误消息
        let firstError: string = "";
        if (formattedErrors.email?._errors?.length > 0) {
          firstError = formattedErrors.email._errors[0];
        } else if (formattedErrors.password?._errors?.length > 0) {
          firstError = formattedErrors.password._errors[0];
        } else if (formattedErrors.confirmPassword?._errors?.length > 0) {
          firstError = formattedErrors.confirmPassword._errors[0];
        } else {
          firstError = "表单验证失败，请检查输入";
        }

        setError(true);
        setErrorMessage(firstError);
        setIsLoading(false);
        return;
      }

      console.log("验证通过，发送注册请求..."); // 调试日志

      // 发送注册请求
      const response = await axios.post(
        "/api/register", // 确认这是正确的API路径
        { email, password, confirmPassword },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("注册响应:", response.status, response.data); // 调试日志

      // 检查成功状态
      if (response.status === 201 || response.status === 200) {
        // 注册成功，显示成功消息并跳转
        alert("注册成功！请登录");
        router.push("/pages/login");
      } else {
        // 其他状态码处理
        throw new Error(response.data?.error || "注册失败");
      }
    } catch (error: any) {
      console.error("注册失败:", error); // 调试日志
      setError(true);
      // 错误消息提取逻辑
      if (error.response) {
        setErrorMessage(error.response.data?.error || "注册失败，请稍后重试");
        console.log(
          "错误响应详情:",
          error.response.status,
          error.response.data
        ); // 调试日志
      } else if (error.request) {
        setErrorMessage("网络请求失败，请检查您的网络连接");
        console.log("请求错误:", error.request); // 调试日志
      } else {
        setErrorMessage(error.message || "注册过程中发生错误");
      }
    } finally {
      setIsLoading(false); // 重置加载状态
    }
  };

  const handleGithubSignUp = async () => {
    try {
      setRequired(false);
      setIsLoading(true);
      await nextAuthSignIn("github", { callbackUrl: "/pages/login" });
    } catch (error) {
      console.error("GitHub 登录失败:", error);
      setErrorMessage("GitHub 登录失败，请稍后重试");
    } finally {
      setRequired(true);
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleRegister}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign Up to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to sign up to your account
        </p>
      </div>

      {/* 显示错误消息 */}
      {error && errorMessage && (
        <div className="bg-destructive/15 text-destructive text-center p-2 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          {ifRequired ? (
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              ref={emailRef}
              onChange={handleInputChange}
              value={formValues.email}
            />
          ) : (
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              ref={emailRef}
              onChange={handleInputChange}
              value={formValues.email}
            />
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          {ifRequired ? (
            <Input
              id="password"
              type="password"
              required
              ref={passwordRef}
              onChange={handleInputChange}
              value={formValues.password}
            />
          ) : (
            <Input
              id="password"
              type="password"
              ref={passwordRef}
              onChange={handleInputChange}
              value={formValues.password}
            />
          )}
        </div>
        <div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
            </div>
            {ifRequired ? (
              <Input
                id="confirmpassword"
                type="password"
                required
                ref={confirmRef}
                onChange={handleInputChange}
                value={formValues.confirmPassword}
              />
            ) : (
              <Input
                id="confirmPassword"
                type="password"
                ref={confirmRef}
                onChange={handleInputChange}
                value={formValues.confirmPassword}
              />
            )}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button
          type="button" // 确保不触发表单提交
          variant="outline"
          className="w-full"
          onClick={handleGithubSignUp}
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
          >
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Sign Up with GitHub
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have account?{" "}
        <a href="/pages/login" className="underline underline-offset-4">
          Log In
        </a>
      </div>
    </form>
  );
};

export default SignUpForm;
