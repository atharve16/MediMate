import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Video, AlertTriangle, Loader2 } from "lucide-react";
import { ChatData } from "../context/chatContext"; // Adjust path as needed
import { AuthData } from "../context/authContext"; // Adjust path as needed

const Doctor = () => {
  const navigate = useNavigate();
  const { startNewConversation, setCurrentChat } = ChatData();
  const { user } = AuthData();

  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get("http://localhost:8080/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter only users with role "doctor"
      const doctorsList = response.data.filter(
        (user) => user.role === "doctor"
      );
      setDoctors(doctorsList);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Unable to load doctors. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Handle starting a conversation with a doctor
  const handleStartConversation = async (doctorId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const conversation = await startNewConversation(doctorId);
      if (conversation) {
        navigate("/message");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // Fade in animation configuration
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto w-12 h-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center bg-red-50 p-8 rounded-xl">
          <AlertTriangle className="mx-auto w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Connection Error
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDoctors}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div className="text-center mb-16" {...fadeIn}>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Expert Doctors
          </h2>
          <p className="text-xl text-gray-600">
            {doctors.length > 0
              ? "Experienced healthcare professionals at your service"
              : "No doctors currently available"}
          </p>
        </motion.div>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div className="text-center py-16 bg-gray-100 rounded-xl">
            <p className="text-xl text-gray-600">
              Our doctor roster is currently being updated. Please check back
              soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                className="hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={doctor.image || "/api/placeholder/300/300"}
                      alt={doctor.name}
                      className="w-full h-64 object-cover"
                    />
                    <div
                      className={`
                      absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm
                      ${
                        doctor.avaibility === "Available"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {doctor.avaibility || "Busy"}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {doctor.name}
                    </h3>
                    <div className="flex items-center mb-4">
                      <span className="text-blue-600">
                        {doctor.speciality || "General Medicine"}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-600">
                        {doctor.exp || "5"} Years Experience
                      </span>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate("/virtual-consult")}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg 
                        hover:bg-blue-700 transition-colors flex items-center 
                        justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Video Consult
                      </button>
                      <button
                        onClick={() => handleStartConversation(doctor._id)}
                        className="flex-1 border border-blue-600 text-blue-600 
                        py-2 rounded-lg hover:bg-blue-50 transition-colors 
                        flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctor;
