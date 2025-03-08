import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../Component/assets/Card";
import {
  Calendar,
  Heart,
  Activity,
  Clock,
  FileText,
  Thermometer,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

const HealthMetricsCard = ({ title, value, unit, icon: Icon, trend }) => (
  <Card className="hover:shadow-lg transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-full ${
              trend > 0 ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <Icon
              className={`w-6 h-6 ${
                trend > 0 ? "text-green-600" : "text-blue-600"
              }`}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h4 className="text-2xl font-bold">
              {value}
              <span className="text-sm ml-1">{unit}</span>
            </h4>
          </div>
        </div>
        {trend && (
          <div
            className={`flex items-center ${
              trend > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const HealthDashboard = () => {
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 98.6,
    oxygenLevel: 98,
    steps: 8432,
    sleep: 7.5,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <HealthMetricsCard
        title="Heart Rate"
        value={healthData.heartRate}
        unit="bpm"
        icon={Heart}
        trend={2.5}
      />
      <HealthMetricsCard
        title="Blood Pressure"
        value={healthData.bloodPressure}
        unit="mmHg"
        icon={Activity}
        trend={-1.2}
      />
      <HealthMetricsCard
        title="Temperature"
        value={healthData.temperature}
        unit="°F"
        icon={Thermometer}
        trend={0.3}
      />
      <HealthMetricsCard
        title="Oxygen Level"
        value={healthData.oxygenLevel}
        unit="%"
        icon={Activity}
        trend={1.5}
      />
      <HealthMetricsCard
        title="Daily Steps"
        value={healthData.steps}
        unit="steps"
        icon={Activity}
        trend={5.2}
      />
      <HealthMetricsCard
        title="Sleep"
        value={healthData.sleep}
        unit="hrs"
        icon={Clock}
        trend={-0.8}
      />
    </div>
  );
};

const EnhancedAppointmentForm = () => {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const availableTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Schedule Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Department</label>
            <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">Choose Department</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="pediatrics">Pediatrics</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose Doctor</option>
              <option value="dr-smith">Dr. Smith - Cardiologist</option>
              <option value="dr-jones">Dr. Jones - Neurologist</option>
              <option value="dr-wilson">Dr. Wilson - Orthopedist</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Time</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Patient Name"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Describe your symptoms or reason for visit"
            rows={4}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <button className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors">
            Schedule Appointment
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

const ReportCard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="pt-20 container mx-auto px-4">
        {/* Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <HealthDashboard />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-10 h-10 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Dr. Sarah Johnson</h4>
                      <p className="text-sm text-gray-500">
                        Tomorrow, 10:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                    <Stethoscope className="w-10 h-10 text-green-500" />
                    <div>
                      <h4 className="font-semibold">Regular Checkup</h4>
                      <p className="text-sm text-gray-500">
                        Next Week, 2:30 PM
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appointment Booking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EnhancedAppointmentForm />
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Health Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-blue-500" />
                      <div>
                        <h4 className="font-semibold">Blood Test Results</h4>
                        <p className="text-sm text-gray-500">Last week</p>
                      </div>
                    </div>
                    <button className="text-blue-500 hover:text-blue-600">
                      View
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-blue-500" />
                      <div>
                        <h4 className="font-semibold">X-Ray Report</h4>
                        <p className="text-sm text-gray-500">2 weeks ago</p>
                      </div>
                    </div>
                    <button className="text-blue-500 hover:text-blue-600">
                      View
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportCard;