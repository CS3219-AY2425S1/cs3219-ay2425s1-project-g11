'use client';
import React from 'react';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/state/useAuthStore';
import Avatar, { genConfig } from 'react-nice-avatar';
import { useQuestionStore } from '@/state/useQuestionStore';
import { PreMatch } from '@/components/dialogs/PreMatch';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { isAuth, clearAuth, user } = useAuthStore();
  const { toggleDialogOpen } = useQuestionStore();
  const path = usePathname();

  const handleLogout = async () => {
    const res = await logout();
    if (res) {
      clearAuth();
      return;
    }
  };

  const avatarConfig = user ? genConfig(user.username) : undefined;

  return (
    <nav className="fixed top-0 z-10 w-full bg-gray-800 p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          PeerPrep
        </Link>
        <div className="flex items-center space-x-4">
          {user?.isAdmin && (
            <Link href="/admin" className="text-gray-300 hover:text-white">
              Admin
            </Link>
          )}
          <Link href="/" className="text-gray-300 hover:text-white">
            Questions
          </Link>
          {/* Admin users should be able to add questions instead of match */}
          {path === '/admin' ? (
            <Button
              onClick={toggleDialogOpen}
              className="text-gray-300 hover:text-white"
            >
              Add Question
            </Button>
          ) : path !== '/match' ? (
            <PreMatch />
          ) : null}
          {isAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 rounded-full"
                >
                  {avatarConfig ? (
                    <div className="h-full w-full scale-x-[-1] transform">
                      <Avatar
                        style={{ width: '100%', height: '100%' }}
                        {...avatarConfig}
                      />
                    </div>
                  ) : (
                    <UserCircle className="h-6 w-6 text-gray-300" />
                  )}
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem disabled>
                  <span className="font-semibold">Hi {user?.username}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/signin">
              <Button className="bg-blue-500 hover:bg-blue-600">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
