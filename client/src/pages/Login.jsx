import { useState } from "react";
import { useLogin } from "../features/auth/hooks/useLogin";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { mutate, isLoading } = useLogin();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    mutate(formData, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white rounded-xl shadow"
      >
        <h1 className="text-2xl font-bold mb-5">
          Login
        </h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full border p-3 mb-4 rounded"
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="w-full border p-3 mb-4 rounded"
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
        />

        <button
          disabled={isLoading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;