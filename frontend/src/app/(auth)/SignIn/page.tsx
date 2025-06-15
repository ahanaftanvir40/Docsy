"use client";
import React, { useEffect } from "react";
import { FileText, Users, Edit3, ArrowLeft } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Providers/AuthProvider";
import axios from "axios";

function SignIn() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;
    if (token) {
      const BaseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      console.log("BaseURL:", BaseURL);

      const res = await axios.post(`${BaseURL}/api/user/login`, {
        token,
      });
      if (res.status === 200) {
        login(res.data.token);
        router.push("/dashboard");
      }
    }
  };
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="flex flex-col justify-center px-12 xl:px-16 relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Docsy</span>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
              Welcome back to your
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                creative workspace
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Continue collaborating with your team and bring your ideas to life
              in real-time.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Real-time Collaboration
                  </h3>
                  <p className="text-gray-600">Work together seamlessly</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Rich Text Editing
                  </h3>
                  <p className="text-gray-600">Beautiful formatting tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-24 h-24 bg-blue-100 rounded-full opacity-60 animate-pulse"></div>
        <div
          className="absolute bottom-32 right-12 w-16 h-16 bg-indigo-100 rounded-full opacity-40 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-32 w-8 h-8 bg-emerald-100 rounded-full opacity-50 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Right Section - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20">
        {/* Back to Home Link */}
        <div className="absolute top-6 left-6 lg:left-auto lg:right-6">
          <a
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Mobile Logo */}
        <div className="flex items-center space-x-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Docsy</span>
        </div>

        <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to Docsy
            </h2>
            <p className="text-gray-600">Continue your collaborative journey</p>
          </div>

          {/* Google Sign In Button */}
          <GoogleLogin onSuccess={handleLogin}></GoogleLogin>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Secure sign in
              </span>
            </div>
          </div>

          {/* Security Note */}
          <div className="text-center">
            <p className="text-sm text-gray-500 leading-relaxed">
              By signing in, you agree to our{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-semibold text-gray-900">
                Join 10,000+ teams
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Already collaborating and creating amazing content together on
              Docsy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
