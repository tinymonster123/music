"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomRef } from "@/app/hooks/emailandpassword";
import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validation";

const LoginForm: React.FC<CustomRef> = ({ className, ...props }) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [ifRequired, setRequired] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    setErrorMessage("");
    setIsLoading(true);

    try {
      const email = emailRef.current?.value || "";
      const password = passwordRef.current?.value || "";

      console.log("登录提交:", { email, password: "******" });

      // 客户端验证
      const validationResult = loginSchema.safeParse({ email, password });
      if (!validationResult.success) {
        const formattedErrors = validationResult.error.format();
        let firstError = "";
        if (formattedErrors.email?._errors?.length > 0) {
          firstError = formattedErrors.email._errors[0];
        } else if (formattedErrors.password?._errors?.length > 0) {
          firstError = formattedErrors.password._errors[0];
        } else {
          firstError = "表单验证失败，请检查输入";
        }

        setError(true);
        setErrorMessage(firstError);
        return;
      }

      // 使用 Auth.js 登录
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        console.error("登录失败:", result.error);
        setError(true);
        setErrorMessage(
          result.error === "CredentialsSignin" ? "邮箱或密码错误" : result.error
        );
      } else {
        // 登录成功，重定向到主页
        console.log("登录成功");
        router.push("/");
        router.refresh(); // 刷新以更新导航栏状态
      }
    } catch (error: any) {
      console.error("登录错误:", error);
      setError(true);
      setErrorMessage(error.message || "登录过程中发生错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setRequired(false);
      setIsLoading(true);
      await signIn("github", { callbackUrl: "/" });
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
      onSubmit={handleSignIn}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>

      {/* 错误消息显示 */}
      {error && errorMessage && (
        <div className="bg-destructive/15 text-destructive text-center p-2 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            ref={emailRef}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            ref={passwordRef}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={handleGithubSignIn}
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
          Login with GitHub
        </Button>
      </div>
      <div className="text-center text-sm">Don&apos;t have an account? </div>
      <a href="/pages/signup" className="underline underline-offset-4">
        Sign up
      </a>
    </form>
  );
};

export default LoginForm;
