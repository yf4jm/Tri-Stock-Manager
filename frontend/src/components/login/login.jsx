import { useEffect, useState } from "react";
import axios from "axios";

const Login = ({isLoggedIn,setIsLoggedIn}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // Store tokens in localStorage (or you could use a state management solution)
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Redirect or handle login success (for example, you could toggle the login state here)
      alert("Login successful!");
      window.location.reload();
    } catch (err) {
      setError("Username or password is incorrect.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      // Optionally, you can verify the token here or check if it's expired
      setIsLoggedIn(true);
    }
  }, []);
  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    alert("Logout successful!");
    window.location.reload();
  };
  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      {!isLoggedIn ? (
        <div className=" p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded-md"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      ): (
      <div className="p-6 rounded-lg shadow-lg w-96 flex flex-col gap-5">
      <p>logged in as kawthar souid</p>
        <button className="w-full bg-red-500 text-white p-2 rounded-md" onClick={handleLogout}>logout</button>
      </div>
      )}
      
    </div>
  );
};

export default Login;
