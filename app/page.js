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
    if (bmi < 18.5) return { category: 'underweight', emoji: '🏃‍♂️' };
    if (bmi < 25) return { category: 'normal', emoji: '🥗' };
    if (bmi < 30) return { category: 'overweight', emoji: '🚶‍♂️' };
    return { category: 'obese', emoji: '💪' };
  };

  const getBmiAdvice = (bmi) => {
    if (bmi < 18.5) return "Focus on nutrient-dense foods to gain healthy weight. Consider strength training to build muscle mass.";
    if (bmi < 25) return "Great job maintaining a healthy weight! Keep up your balanced diet and regular exercise routine.";
    if (bmi < 30) return "Small changes can make a big difference. Try incorporating more vegetables and daily walks into your routine.";
    return "Your health is important. Consider consulting a nutritionist and starting with low-impact exercises like swimming or yoga.";
  };

  const getActivityEmoji = (level) => {
    const emojis = {
      sedentary: '💻',
      light: '🚶',
      moderate: '🏋️',
      active: '🏃',
      veryActive: '🏅'
    };
    return emojis[level] || '🤷';
  };

  const getMacroChart = () => {
    const data = [
      { name: 'Protein', value: macros.protein },
      { name: 'Fat', value: macros.fat },
      { name: 'Carbs', value: macros.carbs },
    ];

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const { category, emoji } = getBmiCategory(bmi);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg">
        <CardHeader className="text-2xl font-bold text-center text-gray-800">
          Your Personalized Health Journey, {userData.name}! {emoji}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-600">{bmi}</p>
            <p className="text-xl text-gray-600">Your BMI</p>
            <p className="text-lg text-gray-700">Category: <span className="font-semibold">{category}</span></p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">💡 Personal Insight</h3>
            <p className="text-gray-700">{getBmiAdvice(bmi)}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">🔥 Daily Energy Needs</h3>
            <p className="text-gray-700">Your estimated daily calorie needs: <span className="font-bold text-green-600">{Math.round(bmr)} kcal</span></p>
            <p className="text-sm text-gray-600">Based on your {userData.activityLevel} activity level {getActivityEmoji(userData.activityLevel)}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">🍽️ Macronutrient Balance</h3>
            {getMacroChart()}
            <div className="mt-2 text-sm text-gray-600">
              <p>Protein: {macros.protein}g | Fat: {macros.fat}g | Carbs: {macros.carbs}g</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">🌟 Your Next Steps</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Set realistic, achievable health goals</li>
              <li>Stay hydrated with 8 glasses of water daily</li>
              <li>Aim for 7-9 hours of quality sleep each night</li>
              <li>Find physical activities you enjoy and do them regularly</li>
              <li>Practice mindfulness or meditation to manage stress</li>
            </ul>
          </div>

          <motion.button
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-md w-full"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Share Your Health Journey 🌈
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  );
};



export default HealthDashboardChatbot;