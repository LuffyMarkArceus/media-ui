import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { DarkModeSwitch } from "@/components/DarkModeSwitch";
import { Link } from "react-router-dom";

export function TopNav() {
  return (
    <nav className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold">
      <div>
        <Link to={"/"}>Video Library</Link>
      </div>
      <div className="flex flex-row gap-4 items-center">
        <DarkModeSwitch />
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </nav>
  );
}
