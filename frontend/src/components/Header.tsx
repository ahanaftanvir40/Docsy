"use client";
import React, { useState } from "react";
import { FileText, ArrowLeft, Search, Plus, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/Providers/AuthProvider";
import { useSearch } from "@/Providers/SearchProvider";
import Image from "next/image";
import NewButton from "./NewButton";

function Header() {
  const pathname = usePathname();

  const { isAuthenticated, logout, user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isSignInPage = pathname === "/SignIn";
  if (isSignInPage) {
    return null;
  }

  if (pathname.startsWith("/document")) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Docsy</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {!pathname.startsWith("/document") && (
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 outline-none border text-gray-700 border-gray-200 rounded-lg  w-64"
                  />
                </div>
              )}
              {!pathname.startsWith("/document") && <NewButton />}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.fullname}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Unauthenticated header (for home/landing page)
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
