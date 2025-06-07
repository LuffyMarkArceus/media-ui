import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VideoPage from "./pages/VideoPage";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  RedirectToSignIn,
} from "@clerk/clerk-react";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <SignedIn>
              <Home />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/video/:slug"
        element={
          <>
            <SignedIn>
              <VideoPage />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/sign-in/*"
        element={<SignIn routing="path" path="/sign-in" />}
      />
      <Route
        path="/sign-up/*"
        element={<SignUp routing="path" path="/sign-up" />}
      />
    </Routes>
  );
}
