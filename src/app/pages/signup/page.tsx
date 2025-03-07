"use client";
import { ArrowLeft } from "lucide-react";
import SignUpForm from "@/components/signup-form";


const SignUpPage = () => {
  
  return (
    <div className="grid min-h-svh ">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-start gap-2 ">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-start justify-center rounded-full bg-primary text-primary-foreground">
              <ArrowLeft />
            </div>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
