import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Health from "./pages/Health";
import VideoPage from "./pages/VideoPage";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import { UploadModal } from "./components/UploadModal";

export default function App() {
  return (
    <>
      <UploadModal />
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
          path="/video"
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
        <Route
          path="/health"
          element={
            <>
              <SignedIn>
                <Health />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/upload"
          element={
            <>
              <SignedIn></SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </>
  );
}
