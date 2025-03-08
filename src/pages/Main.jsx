import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Calendar, Heart, MessageSquare,
  Video, FileText, Users, Bell, ChevronRight, Star, 
  Activity, Stethoscope, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "../Component/assets/Card";
import Doctor from "./doctors";

const services = [
  {
    title: "Virtual Consultation",
    description: "Connect with specialists through secure video calls",
    icon: <Video className="w-8 h-8 text-blue-600" />,
    route: "/virtual-consult",
    stats: "4.9/5 Patient Satisfaction",
  },
  {
    title: "Patient Records",
    description: "Access your medical history and reports digitally",
    icon: <FileText className="w-8 h-8 text-emerald-600" />,
    route: "/report",
    stats: "256-bit Encryption",
  },
  {
    title: "Doctor Network",
    description: "Access to 10,000+ verified specialists",
    icon: <Users className="w-8 h-8 text-violet-600" />,
    route: "/doctors",
    stats: "Trusted by 1M+ patients",
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock medical assistance",
    icon: <Shield className="w-8 h-8 text-rose-600" />,
    route: "/message",
    stats: "< 10min response time",
  },
];

const blogs = [
  {
    title: "Understanding Heart Health",
    excerpt:
      "Learn about maintaining a healthy heart through diet and exercise.",
    date: "2024-03-20",
    likes: 245,
    comments: 18,
  },
  {
    title: "Mental Health Awareness",
    excerpt:
      "Tips for maintaining good mental health in today's fast-paced world.",
    date: "2024-03-18",
    likes: 189,
    comments: 24,
  },
  {
    title: "COVID-19 Updates",
    excerpt: "Latest research and guidelines for COVID-19 prevention.",
    date: "2024-03-15",
    likes: 312,
    comments: 45,
  },
];

const HealthcarePlatform = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNo: "",
    patientEmail: "",
    patientDate: "",
    diseaseType: "",
    message: "",
  });

  useEffect(() => {
    setIsLoaded(true);
    setTimeout(() => {
      toast("Doctor Available", {
        description: "Dr. Sarah is available for consultation now!",
        icon: <Bell className="w-5 h-5 text-blue-500" />,
        duration: 5000,
      });
    }, 3000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Form validation
    if (!formData.patientName || !formData.phoneNo || !formData.patientEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Success notification
    toast.success("Booking Confirmed!", {
      description: "We'll contact you shortly with appointment details.",
      duration: 5000,
    });

    // Reset form
    setFormData({
      patientName: "",
      phoneNo: "",
      patientEmail: "",
      patientDate: "",
      diseaseType: "",
      message: "",
    });
  };
  const [showNotification, setShowNotification] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
    // Simulating notification
    setTimeout(() => setShowNotification(true), 3000);
  }, []);
  const navigateToConsult = () => {
    navigate("/virtual-consult");
  };

  const [symptoms, setSymptoms] = useState("");
  const [prescription, setPrescription] = useState("");

  const symptomPrescriptions = {
    Fever: "Paracetamol 500mg, every 4 hours",
    Cough: "Cough Syrup, every 4 hours",
    Headache: "Ibuprofen 400mg, every 4 hours",
    "Sore Throat": "Lozenges, every 4 hours",
    Diarrhea: "Oral Rehydration Solution, every 4 hours",
    Fatigue: "Rest, Vitamin B12 100mcg, every 4 hours",
  };

  const generatePrescription = () => {
    const symptomArray = symptoms.split(", ");
    let prescriptionText = "Prescription:\n\n";

    for (const symptom of symptomArray) {
      const trimmedSymptom = symptom.trim();
      const prescription = symptomPrescriptions[trimmedSymptom];
      prescriptionText += `${trimmedSymptom}: ${
        prescription || "No prescription available"
      }\n`;
    }

    setPrescription(prescriptionText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Floating Notification */}
      {showNotification && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed top-4 right-4 z-50"
        ></motion.div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1 rounded-full">
                  Trusted by 1M+ Patients
                </span>
              </div>
              <h1 className="text-6xl font-bold text-gray-900 leading-tight">
                Your Health,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {" "}
                  Our Priority
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience healthcare reimagined with AI-powered diagnostics,
                instant specialist access, and personalized care plans.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate("/patient-form")}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                           transform hover:-translate-y-1 transition-all duration-200 
                           shadow-lg hover:shadow-blue-500/30 flex items-center"
                >
                  Start Your Journey
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/virtual-consult")}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 
                           border-2 border-blue-600 transform hover:-translate-y-1 
                           transition-all duration-200 flex items-center"
                >
                  Virtual Consultation
                  <Video className="ml-2 w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-8 pt-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">98%</span>
                  <span className="text-gray-600">Success Rate</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">24/7</span>
                  <span className="text-gray-600">Doctor Support</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">10k+</span>
                  <span className="text-gray-600">Specialists</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-semibold">Live Health Monitoring</p>
                  <p className="text-sm text-gray-600">
                    Real-time vitals tracking
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="font-semibold">AI Diagnostics</p>
                  <p className="text-sm text-gray-600">99.9% accuracy</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600">
              Integrating technology with healthcare for a better tomorrow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={service.route}>
                  <Card
                    className="h-full hover:shadow-2xl transition-all duration-300 
                             transform hover:-translate-y-2 cursor-pointer 
                             bg-gradient-to-br from-white to-blue-50/50"
                    onMouseEnter={() => setActiveService(index)}
                    onMouseLeave={() => setActiveService(null)}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div
                          className="w-16 h-16 rounded-2xl bg-blue-100/50 
                                    flex items-center justify-center mb-6 
                                    transform transition-all duration-300 
                                    group-hover:scale-110"
                        >
                          {service.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {service.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {service.stats}
                        </div>
                      </div>
                      <div
                        className={`flex items-center text-blue-600 
                                    transition-all duration-300 
                                    ${
                                      activeService === index
                                        ? "translate-x-2"
                                        : ""
                                    }`}
                      >
                        <span className="mr-2">Learn More</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Section with Enhanced UI */}
      <Doctor />

      {/* Appointment Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600">
              Book Your Consultation
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span>Registration Fee</span>
                    <span className="font-bold">₹799</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Consultation Fee</span>
                    <span className="font-bold">₹349</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Prescription Fee</span>
                    <span className="font-bold">₹199</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="font-semibold mb-4">Choose Your Department</h5>
                  <select
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="cardio">Cardio Department</option>
                    <option value="neuro">Neuro Department</option>
                    <option value="ortho">Orthography Department</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Book Your Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="patientName"
                    placeholder="Patient Name"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    name="phoneNo"
                    placeholder="Phone Number"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    name="patientEmail"
                    placeholder="Email Address"
                    value={formData.patientEmail}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    name="patientDate"
                    value={formData.patientDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="diseaseType"
                    value={formData.diseaseType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Disease Type</option>
                    <option value="fever">Fever</option>
                    <option value="cough">Cough</option>
                    <option value="cancer">Cancer</option>
                  </select>
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Confirm Booking
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Recent Blogs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition cursor-pointer"
              >
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold mb-3 hover:text-blue-600 transition">
                    {blog.title}
                  </h4>
                  <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {blog.date}
                    </span>
                    <div className="space-x-4">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1 hover:text-red-500 cursor-pointer" />
                        {blog.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1 hover:text-blue-500 cursor-pointer" />
                        {blog.comments}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Prescription Generator */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Symptoms:</label>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter symptoms (comma separated)"
                  />
                </div>
                <button
                  onClick={generatePrescription}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Generate Prescription
                </button>
                {prescription && (
                  <textarea
                    value={prescription}
                    readOnly
                    className="w-full p-2 border rounded h-40"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <div className="faq container mx-auto my-10 p-6 bg-gray-50 rounded-lg shadow-md">
        {/* FAQ and Health Queries Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">FAQs</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  What is online doctor consultation?
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Are your online doctors qualified?
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  What happens if I don't get a response from a doctor?
                </a>
              </li>
            </ul>
          </div>

          {/* Health Queries */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Health Queries
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-gray-600 hover:text-gray-800 transition-colors">
                OCD negative psychosis
              </li>
              <li className="text-gray-600 hover:text-gray-800 transition-colors">
                X-ray exposure harm baby in 4th week
              </li>
              <li className="text-gray-600 hover:text-gray-800 transition-colors">
                Which protein supplement should I use?
              </li>
            </ul>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-8">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">
            Post Your Feedback
          </h5>
          <input
            type="text"
            className="form-input block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm mt-2 p-3"
            placeholder="Type here"
          />
        </div>
      </div>
    </div>
  );
};

export default HealthcarePlatform;
