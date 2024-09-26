"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input'; // Import the Input component
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import HealthSummary from '@/components/HealthSummary';

const activityLevelMultiplier = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const HealthDashboardChatbot = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    weight: '',
    height: '',
    age: '',
    gender: '',
    activityLevel: '',
  });
  const [healthMetrics, setHealthMetrics] = useState({
    bmi: null,
    bmr: null,
    macros: { protein: null, fat: null, carbs: null },
  });
  const [showSummary, setShowSummary] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = [
    { title: 'Your Name', field: 'name', label: 'What is your name?' },
    { title: 'Weight and Height', fields: ['weight', 'height'], labels: ['Weight (kg)', 'Height (cm)'] },
    { title: 'Age and Gender', fields: ['age', 'gender'], labels: ['Age', 'Select gender'] },
    { title: 'Activity Level', field: 'activityLevel', label: 'Select activity level' },
    { title: 'Health Summary' },
    { title: 'Personalized Fun Summary' },
  ];

  useEffect(() => {
    setProgress((currentStep / (steps.length - 1)) * 100);
  }, [currentStep, steps.length]);

  const calculateHealthMetrics = useCallback(() => {
    const { weight, height, age, gender, activityLevel } = userData;
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    let bmr = gender === 'male'
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.33 * age);
    bmr *= activityLevelMultiplier[activityLevel];
    bmr = Math.round(bmr);

    const proteinRatio = 0.25, fatRatio = 0.25, carbsRatio = 0.50;
    const macros = {
      protein: Math.round(bmr * proteinRatio / 4),
      fat: Math.round(bmr * fatRatio / 9),
      carbs: Math.round(bmr * carbsRatio / 4),
    };

    setHealthMetrics({ bmi, bmr, macros });
  }, [userData]);

  const handleUserDataChange = (field, value) => {
    setUserData(prevData => ({ ...prevData, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateHealthMetrics();
      setShowSummary(true);
    }
  };

  const handleShare = () => {
    const { bmi, bmr, macros } = healthMetrics;
    const shareText = `Check out my health summary! BMI: ${bmi}, BMR: ${bmr} kcal/day, Macros: Protein ${macros.protein}g, Fat ${macros.fat}g, Carbs ${macros.carbs}g.`;
    if (navigator.share) {
      navigator.share({
        title: 'My Health Summary',
        text: shareText,
        url: window.location.href,
      }).catch(error => console.error('Error sharing:', error));
    } else {
      alert('Sharing is not supported in this browser.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 to-yellow-100">
      <header className="bg-gray-900 text-white py-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Health Dashboard</h1>
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
            {showSummary ? (
              <PersonalizedSummary
                healthMetrics={healthMetrics}
                userData={userData}
                handleShare={handleShare}
              />
            ) : (
              <ChatbotStep
                step={steps[currentStep]}
                userData={userData}
                onDataChange={handleUserDataChange}
                onNext={handleNextStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="bg-gray-900 text-white py-4 text-center">
        <p>&copy; {new Date().getFullYear()} Health Dashboard</p>
      </footer>
    </div>
  );
};

const UserDataInput = ({ field, label, value, onChange }) => {
  const handleChange = (e) => {
    const newValue = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return (
    <div className="mb-4">
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Input
        type={field === 'age' || field === 'weight' || field === 'height' ? 'number' : 'text'}
        id={field}
        name={field}
        value={value}
        onChange={handleChange}
        className="w-full"
        min={field === 'age' || field === 'weight' || field === 'height' ? 0 : undefined}
        step={field === 'height' ? 0.1 : 1}
      />
    </div>
  );
};

const ChatbotStep = ({ step, userData, onDataChange, onNext }) => {
  if (step.title === 'Health Summary') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-xl font-semibold">{step.title}</CardHeader>
        <CardContent>
          <HealthSummary userData={userData} />
          <NextButton onClick={onNext} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-xl font-semibold">{step.title}</CardHeader>
      <CardContent>
        {step.fields ? (
          step.fields.map((field, index) => (
            field === 'gender' ? (
              <Select 
                key={field}
                onValueChange={(value) => onDataChange(field, value)}
              >
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <UserDataInput
                key={field}
                field={field}
                label={step.labels[index]}
                value={userData[field]}
                onChange={(value) => onDataChange(field, value)}
              />
            )
          ))
        ) : (
          step.field === 'activityLevel' ? (
            <Select onValueChange={(value) => onDataChange(step.field, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={step.label} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(activityLevelMultiplier).map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <UserDataInput
              field={step.field}
              label={step.label}
              value={userData[step.field]}
              onChange={(value) => onDataChange(step.field, value)}
            />
          )
        )}
        <NextButton onClick={onNext} />
      </CardContent>
    </Card>
  );
};

const NextButton = ({ onClick }) => (
  <motion.button
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    Next
  </motion.button>
);

const PersonalizedSummary = ({ healthMetrics, userData, handleShare }) => {
  const { bmi, bmr, macros } = healthMetrics;

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  };

  const getBmiDescription = (bmi) => {
    if (bmi < 18.5) return 'You may want to consider gaining a few pounds to reach a healthy weight range.';
    if (bmi < 25) return 'You are maintaining a healthy weight. Keep up the good work!';
    if (bmi < 30) return 'You are in the overweight range. Consider making some lifestyle changes to reach a healthy weight.';
    return 'You are in the obese range. It\'s important to make changes to your diet and exercise routine to improve your health.';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>Congratulations on Completing Your Health Assessment!</CardHeader>
        <CardContent>
          <p className="text-lg text-center mb-4">
            Great job, {userData.name}! 🎉
          </p>
          <p className="text-lg text-center">
            Your personalized health summary is ready. Here are some fun facts and tips to keep you motivated:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Your BMI is <strong>{bmi}</strong>, which is considered <strong>{getBmiCategory(bmi)}</strong>.</li>
            <li>{getBmiDescription(bmi)}</li>
            <li>Your daily calorie needs are around <strong>{Math.round(bmr)} kcal/day</strong>.</li>
            <li>For a balanced diet, aim for <strong>{macros.protein}g</strong> of protein, <strong>{macros.fat}g</strong> of fats, and <strong>{macros.carbs}g</strong> of carbs daily.</li>
            <li>Remember, consistency is key! Keep up the good work and stay active.</li>
            <li>Stay hydrated and make sure to get enough sleep for optimal health.</li>
          </ul>
          <p className="text-lg text-center mt-4">
            Keep pushing towards your goals, and remember to have fun along the way! 🌟
          </p>
          <motion.button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Share Your Summary
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  );
};


export default HealthDashboardChatbot;