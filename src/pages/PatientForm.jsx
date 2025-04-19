import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../Component/assets/Card";
import axios from "axios";

const PatientForm = () => {
  const [patient, setPatient] = React.useState({
    patientName: "",
    email: "",
    phone: "",
    dob: new Date().toISOString().split("T")[0],
    gender: "",
    address: "",
    emergencyContact: "",
    bloodGroup: "",
    message: "",
  });

  const handleChange = (e) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(patient);
    sendDoc(patient);
  };

  const sendDoc = async (patient) => {
    try {
      const resp = await axios.post("http://localhost:8080/patient", patient);
      console.log(resp.data);
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mt-5">
        <CardHeader>
          <CardTitle>Patient Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="patientName"
              >
                Full Name
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={patient.patientName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={patient.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={patient.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {/* Date of Birth */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="dob"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={patient.dob}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="gender"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={patient.gender}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="address"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={patient.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
                placeholder="Enter your address"
              ></textarea>
            </div>

            {/* Emergency Contact */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="emergencyContact"
              >
                Emergency Contact
              </label>
              <input
                type="tel"
                id="emergencyContact"
                name="emergencyContact"
                value={patient.emergencyContact}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter emergency contact"
              />
            </div>

            {/* Blood Group */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="bloodGroup"
              >
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={patient.bloodGroup}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Medical History */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="message"
              >
                Medical History
              </label>
              <textarea
                id="message"
                name="message"
                value={patient.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                placeholder="Mention any chronic illness, allergies, or ongoing medications"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientForm;
