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

    const id = setInterval(() => {
      getMatch();
    }, 100000);

    return () => {
      clearInterval(id);
    };
  }, []);

  const getMatch = async () => {
    await fetch(
      "https://www.sofascore.com/api/v1/event/12436883/player/975079/statistics",
      {
        // headers: {
        //   Accept: "application/json",
        //   "Content-Type": "application/json",
        //   "User-Agent":
        //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36",
        // },
      }
    )
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((e) => console.log(e));
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
