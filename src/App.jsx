import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Auth/LogIn";
import SignUp from "./Auth/SignIn";
import Navigation from "./Component/navbar";
import Footer from "./Component/footer";
import Medimate from "./pages/Main";
import Message from "./pages/message";
import Doctor from "./pages/doctors";
import Virtual from "./pages/virtual";
import ReportCard from "./pages/report";
import PatientForm from "./pages/PatientForm";
const App = () => {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/patient-form" element={<PatientForm />} />
          <Route path="/report" element={<ReportCard />} />
          <Route path="/" element={<Medimate />} />
          <Route path="/virtual-consult" element={<Virtual />} />
          <Route path="/message" element={<Message />} />
          <Route path="/doctors" element={<Doctor />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
