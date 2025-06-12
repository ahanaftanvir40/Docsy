"use client";
import React from "react";
import { FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
function Header() {
  const pathname = usePathname();
  const isSignInPage = pathname === "/SignIn";
  if (isSignInPage) {
    return null;
  }

  return (
    <div>
      <header className="border-b border-gray-100 bg-white backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Docsy</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </a>
              <Link
                href={"/SignIn"}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
