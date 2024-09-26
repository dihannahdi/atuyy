"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { v4 as uuidv4 } from 'uuid';

const HealthDashboardChatbot = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    activityLevel: '',
  });
  const [bmi, setBmi] = useState(null);
  const [bmr, setBmr] = useState(null);
  const [macros, setMacros] = useState({
    protein: null,
    fat: null,
    carbs: null,
  });
  const [showSummary, setShowSummary] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((currentStep / (steps.length - 1)) * 100);
  }, [currentStep]);

  const steps = [
    {
      title: 'Weight and Height',
      component: (
        <>
          <UserDataInput
            field="weight"
            label="Weight (kg)"
            value={userData.weight}
            onChange={(value) => handleUserDataChange('weight', value)}
          />
          <UserDataInput
            field="height"
            label="Height (cm)"
            value={userData.height}
            onChange={(value) => handleUserDataChange('height', value)}
          />
        </>
      ),
    },
    {
      title: 'Age and Gender',
      component: (
        <>
          <UserDataInput
            field="age"
            label="Age"
            value={userData.age}
            onChange={(value) => handleUserDataChange('age', value)}
          />
          <Select onValueChange={(value) => handleUserDataChange('gender', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </>
      ),
    },
    {
      title: 'Activity Level',
      component: (
        <Select onValueChange={(value) => handleUserDataChange('activityLevel', value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select activity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentary</SelectItem>
            <SelectItem value="light">Light Exercise</SelectItem>
            <SelectItem value="moderate">Moderate Exercise</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="veryActive">Very Active</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      title: 'Health Summary',
      component: (
        <HealthSummary
          bmi={bmi}
          bmr={bmr}
          macros={macros}
          userData={userData}
        />
      ),
    },
  ];

  // ... (keep the calculation functions as they were)

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateBmi();
      calculateBmr();
      calculateMacros();
      setShowSummary(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <header className="bg-gray-900 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Health Dashboard Chatbot</h1>
      </header>
      <main className="flex-1 p-6">
        <Progress value={progress} className="w-full mb-6" />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            {!showSummary ? (
              <ChatbotStep
                title={steps[currentStep].title}
                component={steps[currentStep].component}
                onNext={handleNextStep}
              />
            ) : (
              <HealthSummary
                bmi={bmi}
                bmr={bmr}
                macros={macros}
                userData={userData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const ChatbotStep = ({ title, component, onNext }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-xl font-semibold">{title}</CardHeader>
      <CardContent>
        {component}
        <motion.button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
          onClick={onNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next
        </motion.button>
      </CardContent>
    </Card>
  );
};

const UserDataInput = ({ field, label, value, onChange }) => {
  return (
    <div className="space-y-2 mb-4">
      <label htmlFor={field} className="block font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        id={field}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

const HealthSummary = ({ bmi, bmr, macros, userData }) => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>Body Mass Index (BMI)</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center mb-4">{bmi}</p>
            <p className="text-lg text-center">
              Your BMI is considered <strong>{getBmiCategory(bmi)}</strong>.
            </p>
            <p className="mt-2 text-center">
              {getBmiDescription(bmi)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card>
          <CardHeader>Basal Metabolic Rate (BMR) & Daily Calorie Needs</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center mb-4">{bmr} kcal/day</p>
            <p className="text-lg text-center">
              To maintain your current weight, aim for approximately{' '}
              <strong>{Math.round(bmr * activityLevelMultiplier[userData.activityLevel])} kcal/day</strong>.
            </p>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Recommended macronutrient intake:</h3>
              <div className="space-y-2">
                <MacroProgressBar label="Protein" value={macros.protein} max={macros.protein + macros.fat + macros.carbs} />
                <MacroProgressBar label="Fats" value={macros.fat} max={macros.protein + macros.fat + macros.carbs} />
                <MacroProgressBar label="Carbs" value={macros.carbs} max={macros.protein + macros.fat + macros.carbs} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card>
          <CardHeader>Next Steps for a Healthy Life</CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Maintain a varied diet with the right mix of proteins, fats, and carbohydrates.</li>
              <li>Aim for regular physical activity to boost metabolism and maintain weight.</li>
              <li>Don't forget to stay hydrated—water is key for metabolism and kidney function.</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const MacroProgressBar = ({ label, value, max }) => {
  const percentage = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>{value}g</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) {
    return 'underweight';
  } else if (bmi >= 18.5 && bmi < 25) {
    return 'normal';
  } else if (bmi >= 25 && bmi < 30) {
    return 'overweight';
  } else {
    return 'obese';
  }
};

const getBmiDescription = (bmi) => {
  if (bmi < 18.5) {
    return 'You may want to consider gaining a few pounds to reach a healthy weight range.';
  } else if (bmi >= 18.5 && bmi < 25) {
    return 'You are maintaining a healthy weight. Keep up the good work!';
  } else if (bmi >= 25 && bmi < 30) {
    return 'You are in the overweight range. Consider making some lifestyle changes to reach a healthy weight.';
  } else {
    return 'You are in the obese range. Its important to make changes to your diet and exercise routine to improve your health.';
  }
};

export default HealthDashboardChatbot;