import { LoginForm } from "@/components/LoginForm";
import { getCookie } from "@/lib/cookie";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("_token");
    const user = getCookie("_user");
    if (token && user) {
      navigate("/dashboard");
    }
  }, []);



  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
