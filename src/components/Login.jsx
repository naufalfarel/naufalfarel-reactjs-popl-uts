import React from "react";

const Login = () => {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-400 to-red-600 px-4 sm:px-6 lg:px-8">
        <div className="relative py-3 sm:max-w-md sm:mx-auto mt-32">
          <div className="min-h-96 px-12 py-8 mt-4 text-left bg-white rounded-2xl shadow-lg">
            <div className="flex flex-col justify-center items-center h-full select-none">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <a
                  href="https://amethgalarcio.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="logo arkana (1).png" className="w-36" alt="Logo" />
                </a>
                <p className="m-0 text-2xl font-bold text-gray-800">
                  Login to Your Account
                </p>
                <span className="m-0 text-sm max-w-[90%] text-center text-gray-600">
                  Get started with our experience and enjoy
                </span>
              </div>
              <div className="w-full flex flex-col gap-4">
                <label className="font-semibold text-sm text-gray-600">
                  Username
                </label>
                <input
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none shadow focus:ring-2 focus:ring-red-400 transition duration-200"
                  placeholder="Username"
                />
              </div>
              <div className="w-full flex flex-col gap-4 mt-4">
                <label className="font-semibold text-sm text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  className="border rounded-lg px-4 py-3 text-sm w-full outline-none shadow focus:ring-2 focus:ring-red-400 transition duration-200"
                  placeholder="••••••••"
                />
              </div>
              <div className="mt-6">
                <button className="mb-4 py-2 px-8 bg-red-500 hover:bg-red-700 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none">
                  Login
                </button>
                <a href="/signin">
                  <button className="py-2 px-8 bg-red-500 hover:bg-red-700 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none">
                    Sign In
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
