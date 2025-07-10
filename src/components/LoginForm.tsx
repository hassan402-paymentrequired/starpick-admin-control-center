import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from "react-hook-form";
import { useFormRequest } from "@/hooks/useForm";
import InputError from "./ui/error";
import { setCookie,setTokenAndUser } from "@/lib/cookie";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type LoginRequest = {
  email: string;
  password: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: formError },
  } = useForm<LoginRequest>();
  const { post, errors, data, loading, setErrors } = useFormRequest();

  const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
    try {
      const res = await post("/auth/admin/login", data);
      setTokenAndUser(res.data.token, res.data.user);
      toast("Login successful");
      navigate("/dashboard");
    } catch (error) {
      setErrors(null);
      setErrors(error.response?.data?.error);
    }
  };

  console.log(errors);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
                <InputError message={errors?.email || ""} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                />
                <InputError message={errors?.password || ""} />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={loading} className="w-full">
                  Login
                </Button>
                <Button variant="outline" className="w-full">
                  Login with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
