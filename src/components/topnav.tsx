import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { Link } from "react-router-dom";

import { Button } from "./ui/button";
import { useAppContext } from "../context/AppContext";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

// A small sub-component to keep TopNav clean
function AdminUploadButton() {
  const { user } = useUser();
  const { setIsUploadModalOpen } = useAppContext();

  // Render button only if the user is the admin
  if (user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL) {
    return (
      <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
        Upload
      </Button>
    );
  }

  return null;
}

export function TopNav() {
  return (
    <nav className="flex w-full items-center justify-between border-b p-4 text-xl font-semibold">
      <div>
        <Link to={"/"}>Video Library</Link>
      </div>
      <div className="flex flex-row gap-4 items-center">
        <DarkModeSwitch />
        <SignedIn>
          <AdminUploadButton />
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </nav>
  );
}
