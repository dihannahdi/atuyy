"use client";

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import Input from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import HealthSummary from '../components/HealthSummary';
import { validateInput, debounce } from '../utils/helpers';
import { fetchUserData, saveUserData } from '../services/api';

const LazyComponent = lazy(() => import('@/components/LazyComponent'));

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
  const [errors, setErrors] = useState({});
  
  const steps = [
    { title: 'Your Name', field: 'name', label: 'What is your name?' },
    { title: 'Weight and Height', fields: ['weight', 'height'], labels: ['Weight (kg)', 'Height (cm)'] },
    { title: 'Age & Gender', fields: ['age', 'gender'], labels: ['Age', 'Select gender'] },
    { title: 'Activity Level', field: 'activityLevel', label: 'Select activity level' },
    { title: 'Health Summary' },
    { title: 'Personalized Fun Summary' },
  ];
  
  useEffect(() => {
    setProgress((currentStep / (steps.length - 1)) * 100);
  }, [currentStep, steps.length]);
  
  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };
  
  const calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
      return (88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)).toFixed(2);
    } else if (gender === 'female') {
      return (447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)).toFixed(2);
    }
    return null;
  };
  
  const updateHealthMetrics = useCallback(() => {
    const { weight, height, age, gender } = userData;
    if (weight && height && age && gender) {
      const bmi = calculateBMI(weight, height);
      const bmr = calculateBMR(weight, height, age, gender);
      setHealthMetrics((prevMetrics) => ({
        ...prevMetrics,
        bmi,
        bmr,
      }));
    }
  }, [userData]);

  useEffect(() => {
    updateHealthMetrics();
  }, [userData, updateHealthMetrics]);

  const onDataChange = (field, value) => {
    setUserData((prevData) => ({ ...prevData, [field]: value }));
  };

  const onNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
      setProgress(((currentStep + 1) / steps.length) * 100);
    } else {
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
    console.log('Share button clicked');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="bg-blue-500 text-white text-center py-4 rounded-t-lg">
          <h2 className="text-2xl font-semibold">{steps[currentStep].title}</h2>
        </CardHeader>
        <CardContent className="p-6">
          {steps[currentStep].field === 'activityLevel' ? (
            <Select onValueChange={(value) => onDataChange(steps[currentStep].field, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={steps[currentStep].label} />
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
              field={steps[currentStep].field}
              label={steps[currentStep].label}
              value={userData[steps[currentStep].field]}
              onChange={(value) => onDataChange(steps[currentStep].field, value)}
            />
          )}
          <NextButton onClick={onNext} />
          <Progress value={progress} className="mt-4" />
        </CardContent>
      </Card>
      {showSummary && <PersonalizedSummary healthMetrics={healthMetrics} userData={userData} handleShare={handleShare} />}
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <CardHeader className="text-xl font-semibold bg-teal-500 text-white py-4">{step.title}</CardHeader>
        <CardContent className="p-6">
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
              <>
                <UserDataInput
                  field={step.field}
                  label={step.label}
                  value={userData[step.field]}
                  onChange={(value) => onDataChange(step.field, value)} 
                />
                <motion.button
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-full mt-4 w-full transition-all duration-300"
                  onClick={onNext}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next
                </motion.button>
              </>
            )
          )}
        </CardContent>
      </Card>
    </motion.div>
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
      <Card className="bg-gradient-to-r from-teal-100 to-blue-100 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <CardHeader className="text-2xl font-bold text-center text-teal-800 py-6">
          Your Health Journey, {userData.name}! {getBmiCategory(bmi).emoji}
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-4xl font-bold text-teal-600">{bmi}</p>
            <p className="text-xl text-teal-700">Your BMI</p>
            <p className="text-lg text-teal-700">Category: <span className="font-semibold">{getBmiCategory(bmi).category}</span></p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg p-4 shadow transition-all duration-300 hover:shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-2 text-teal-700">💡 Personal Insight</h3>
            <p className="text-teal-800">{getBmiAdvice(bmi)}</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg p-4 shadow transition-all duration-300 hover:shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-2 text-teal-700">🔥 Daily Energy Needs</h3>
            <p className="text-teal-800">Your estimated daily calorie needs: <span className="font-bold text-teal-600">{Math.round(bmr)} kcal</span></p>
            <p className="text-sm text-teal-600">Based on your {userData.activityLevel} activity level {getActivityEmoji(userData.activityLevel)}</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg p-4 shadow transition-all duration-300 hover:shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-2 text-teal-700">🍽️ Macronutrient Balance</h3>
            {getMacroChart()}
            <div className="mt-2 text-sm text-teal-600">
              <p>Protein: {macros.protein}g | Fat: {macros.fat}g | Carbs: {macros.carbs}g</p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg p-4 shadow transition-all duration-300 hover:shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-2 text-teal-700">🌟 Your Next Steps</h3>
            <ul className="list-disc list-inside space-y-1 text-teal-800">
              <li>Set realistic, achievable health goals</li>
              <li>Stay hydrated with eight glasses of water daily</li>
              <li>Aim for 7-9 hours of quality sleep each night</li>
              <li>Find physical activities you enjoy and do them regularly</li>
              <li>Practice mindfulness or meditation to manage stress</li>
            </ul>
          </motion.div>

          <motion.button
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-md w-full transition-all duration-300"
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