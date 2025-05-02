import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Auth/LogIn";
import SignUp from "./Auth/SignIn";
import Navigation from "./Component/navbar";
import Footer from "./Component/footer";
import Medimate from "./pages/Main";
import Message from "./pages/message";
import Doctor from "./pages/doctors";
import ReportCard from "./pages/report";
import PatientForm from "./pages/PatientForm";
import { AuthData } from "./context/authContext";
import LobbyScreen from "./VirtualConsultation/lobby";
import RoomPage from "./VirtualConsultation/room";

const App = () => {
  const { isAuth } = AuthData();
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="pt-20">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Medimate />} />
            <Route
              path="/patient-form"
              element={isAuth ? <PatientForm /> : <Login />}
            />
            <Route
              path="/report"
              element={isAuth ? <ReportCard /> : <Login />}
            />
            <Route
              path="/virtual-consult"
              element={isAuth ? <LobbyScreen /> : <Login />}
            />
            <Route
              path="/room/:id"
              element={isAuth ? <RoomPage /> : <Login />}
            />
            <Route path="/message" element={isAuth ? <Message /> : <Login />} />
            <Route path="/doctors" element={isAuth ? <Doctor /> : <Login />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
