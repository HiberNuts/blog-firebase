import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config";
import Profile from "./pages/Profile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));

  const signUserOut = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = "/login";
    });
  };

  return (
    <Router>
      <ToastContainer />
      <nav
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          width: "100%",
          height: "100px",
          alignItems: "center",
        }}
      >
        <Link to="/"> Home </Link>

        {!isAuth ? (
          <Link to="/login"> Login </Link>
        ) : (
          <>
            <Link to="/createpost"> Create Post </Link>
            <button
              style={{
                backgroundColor: "transparent",
                border: "2px solid white",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
              }}
              onClick={signUserOut}
            >
              {" "}
              Log Out
            </button>
          </>
        )}
        {isAuth && (
          <Link to="/profile">
            {" "}
            <img
              style={{ borderRadius: "50%", width: "80px", height: "80px", cursor: "pointer" }}
              src={auth.currentUser?.photoURL}
              alt="Profile"
            />{" "}
          </Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home isAuth={isAuth} />} />
        <Route path="/createpost" element={<CreatePost isAuth={isAuth} />} />
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
