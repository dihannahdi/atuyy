"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from "@/components/ui/alert"


const HealthQuest = () => {
  const [userData, setUserData] = useState({
    gender: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
  });

  const [results, setResults] = useState(null);
  const [showKidneyInfo, setShowKidneyInfo] = useState(false);
  const [errors, setErrors] = useState({});
  const [funFact, setFunFact] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
    validateField(name, value);
  };

  const handleSelectChange = (name, value) => {
    setUserData(prevData => ({ ...prevData, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    switch (name) {
      case 'age':
        if (value <= 0 || value > 120) {
          newErrors.age = 'Age must be between 1 and 120';
        } else {
          delete newErrors.age;
        }
        break;
      case 'weight':
        if (value <= 0 || value > 500) {
          newErrors.weight = 'Weight must be between 1 and 500 kg';
        } else {
          delete newErrors.weight;
        }
        break;
      case 'height':
        if (value <= 0 || value > 300) {
          newErrors.height = 'Height must be between 1 and 300 cm';
        } else {
          delete newErrors.height;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const calculateHealth = () => {
    if (Object.keys(errors).length > 0 || Object.values(userData).some(value => value === '')) {
      setResults(null);
      setFunFact('Please fill all fields correctly before calculating.');
      return;
    }

    const { gender, age, weight, height, activityLevel } = userData;
    const heightInMeters = height / 100;

    // Calculate BMI
    const bmi = weight / (heightInMeters * heightInMeters);

    // Calculate BMR
    let bmr;
    if (gender === 'male') {
      bmr = 66.5 + (13.7 * weight) + (5 * height) - (6.8 * age);
    } else {
      bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
    }

    // Calculate daily calorie needs
    const activityMultipliers = {
      sedentary: 1.2,
      moderate: 1.3,
      active: 1.4,
    };
    const dailyCalories = bmr * activityMultipliers[activityLevel];

    // Calculate nutrient needs (simplified approximations)
    const proteinNeed = weight * 0.8; // 0.8g per kg of body weight
    const fatNeed = dailyCalories * 0.3 / 9; // 30% of calories from fat
    const carbNeed = (dailyCalories - (proteinNeed * 4 + fatNeed * 9)) / 4; // Remaining calories from carbs
    const sodiumNeed = 2300; // mg, general recommendation
    const waterNeed = weight * 0.033; // 33ml per kg of body weight

    // Determine BMI category
    let bmiCategory;
    if (bmi < 17.0) bmiCategory = "Severe underweight";
    else if (bmi < 18.5) bmiCategory = "Mild underweight";
    else if (bmi <= 25.0) bmiCategory = "Normal";
    else if (bmi <= 27.0) bmiCategory = "Mild overweight";
    else bmiCategory = "Severe overweight";

    const newResults = {
      bmi: bmi.toFixed(1),
      bmiCategory,
      bmr: Math.round(bmr),
      dailyCalories: Math.round(dailyCalories),
      proteinNeed: Math.round(proteinNeed),
      fatNeed: Math.round(fatNeed),
      carbNeed: Math.round(carbNeed),
      sodiumNeed,
      waterNeed: waterNeed.toFixed(1),
    };

    setResults(newResults);

    // Update user stats
    updateUserStats({
      health: Math.min(100, Math.max(0, 100 - Math.abs(bmi - 22) * 5)),
      fitness: Math.min(100, activityLevel === 'active' ? 80 : activityLevel === 'moderate' ? 60 : 40),
      nutrition: Math.min(100, 70 + (waterNeed >= 2 ? 15 : 0) + (proteinNeed >= weight * 0.8 ? 15 : 0)),
    });

    // Generate fun fact
    const worldAverageBMI = 26.6; // According to WHO data
    if (bmi < worldAverageBMI) {
      setFunFact(`Your BMI is lower than the world average of 26.6. You're in better shape than many people globally!`);
    } else if (bmi > worldAverageBMI) {
      setFunFact(`Your BMI is higher than the world average of 26.6. There's room for improvement, but remember, BMI isn't everything!`);
    } else {
      setFunFact(`Your BMI is exactly the world average of 26.6. What are the odds?`);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Health Quest: BMI and BMR Calculator</h2>
      <Card className="bg-gradient-to-br from-green-400 to-blue-500 p-6">
        <CardContent className="text-white">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Select onValueChange={(value) => handleSelectChange('gender', value)}>
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Input name="age" type="number" placeholder="Age" onChange={handleInputChange} className="bg-white text-black" />
            <Input name="weight" type="number" placeholder="Weight (kg)" onChange={handleInputChange} className="bg-white text-black" />
            <Input name="height" type="number" placeholder="Height (cm)" onChange={handleInputChange} className="bg-white text-black" />
            <Select onValueChange={(value) => handleSelectChange('activityLevel', value)}>
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Activity Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Almost never exercises</SelectItem>
                <SelectItem value="moderate">Rarely exercises</SelectItem>
                <SelectItem value="active">Frequently exercises</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {Object.keys(errors).map((key) => (
            <Alert variant="destructive" key={key} className="mb-2">
              <AlertDescription>{errors[key]}</AlertDescription>
            </Alert>
          ))}
          <Button onClick={calculateHealth} variant="secondary">Calculate</Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="mt-4 p-4 bg-white text-black">
          <h3 className="text-xl font-semibold mb-2">Your Results</h3>
          <p>BMI: {results.bmi} ({results.bmiCategory})</p>
          <p>BMR: {results.bmr} kcal</p>
          <p>Daily Calorie Needs: {results.dailyCalories} kcal</p>
          <h4 className="font-semibold mt-2">Daily Nutrient Needs:</h4>
          <ul>
            <li>Protein: {results.proteinNeed}g</li>
            <li>Fat: {results.fatNeed}g</li>
            <li>Carbohydrates: {results.carbNeed}g</li>
            <li>Sodium: {results.sodiumNeed}mg</li>
            <li>Water: {results.waterNeed} liters</li>
          </ul>
          {funFact && (
            <Alert className="mt-4">
              <AlertDescription>{funFact}</AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      <Button onClick={() => setShowKidneyInfo(true)} className="mt-4" variant="outline">
        Learn about Kidney Failure
      </Button>

      <AlertDialog open={showKidneyInfo} onOpenChange={setShowKidneyInfo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Understanding Kidney Failure</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Kidney failure is a condition where the kidneys can no longer filter waste and excess fluids from the blood. In children, this condition can be acute (sudden) or chronic (long-term).</p>
              <h4 className="font-semibold mt-2">Symptoms:</h4>
              <ul className="list-disc pl-5">
                <li>High blood pressure</li>
                <li>Weight loss or slowed growth</li>
                <li>Edema (swelling), especially around eyes, feet, or ankles</li>
                <li>Fatigue or lethargy</li>
                <li>Nausea and vomiting</li>
                <li>Frequent or reduced urination</li>
                <li>Blood or foam in urine</li>
              </ul>
              <h4 className="font-semibold mt-2">Prevention:</h4>
              <ul className="list-disc pl-5">
                <li>Manage underlying conditions like diabetes or hypertension</li>
                <li>Avoid using medications without doctor's supervision</li>
                <li>Consume adequate water</li>
                <li>Regular kidney health check-ups, especially if there's a family history</li>
              </ul>
              <h4 className="font-semibold mt-2">Complications:</h4>
              <ul className="list-disc pl-5">
                <li>Heart or blood vessel damage</li>
                <li>Anemia</li>
                <li>Bone damage or mineral disorders</li>
                <li>Electrolyte imbalances, such as hyperkalemia</li>
                <li>Sudden death</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const GamifiedHealthDashboard = () => {
  const [userStats, setUserStats] = useState({
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    health: 50,
    fitness: 30,
    nutrition: 40,
  });

  const [dailyGoals, setDailyGoals] = useState({
    steps: 0,
    water: 0,
    sleep: 0,
  });

  const shareResults = () => {
    const shareText = `Check out my health stats! Level: ${userStats.level}, Health: ${userStats.health}, Fitness: ${userStats.fitness}, Nutrition: ${userStats.nutrition}. #HealthApp`;
    if (navigator.share) {
      navigator.share({
        title: 'My Health Stats',
        text: shareText,
        url: window.location.href,
      }).then(() => {
        console.log('Thanks for sharing!');
      }).catch(console.error);
    } else {
      // Fallback for browsers that do not support the Web Share API
      alert('Sharing is not supported in this browser.');
    }
  };

  const [showGoalSetter, setShowGoalSetter] = useState(false);

  const updateStats = (stat, value) => {
    setUserStats(prevStats => ({
      ...prevStats,
      [stat]: value,
      exp: prevStats.exp + 10,
    }));
  };

  const setDailyGoal = (goal, value) => {
    setDailyGoals(prevGoals => ({
      ...prevGoals,
      [goal]: value,
    }));
  };

  useEffect(() => {
    if (userStats.exp >= userStats.nextLevelExp) {
      setUserStats(prevStats => ({
        ...prevStats,
        level: prevStats.level + 1,
        exp: prevStats.exp - prevStats.nextLevelExp,
        nextLevelExp: Math.round(prevStats.nextLevelExp * 1.5),
      }));
    }
  }, [userStats.exp, userStats.nextLevelExp]);

  const statsData = [
    { name: 'Health', value: userStats.health },
    { name: 'Fitness', value: userStats.fitness },
    { name: 'Nutrition', value: userStats.nutrition },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 p-8">
      <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <h1 className="text-3xl font-bold">Health Quest Dashboard</h1>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="text-xl">Level {userStats.level}</p>
              <Progress value={(userStats.exp / userStats.nextLevelExp) * 100} className="w-48 mt-2" />
            </div>
            <Button onClick={() => setShowGoalSetter(!showGoalSetter)} variant="secondary">
              {showGoalSetter ? 'Hide' : 'Set'} Daily Goals
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Improve Your Stats</h2>
              {['health', 'fitness', 'nutrition'].map((stat) => (
                <div key={stat} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {stat}
                  </label>
                  <Slider
                    defaultValue={[userStats[stat]]}
                    max={100}
                    step={1}
                    onValueChange={(value) => updateStats(stat, value[0])}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {showGoalSetter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 p-6 bg-gray-100 rounded-lg"
            >
              <h2 className="text-2xl font-semibold mb-4">Set Daily Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Steps
                  </label>
                  <Input
                    type="number"
                    value={dailyGoals.steps}
                    onChange={(e) => setDailyGoal('steps', parseInt(e.target.value))}
                    min={0}
                    max={50000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Water (glasses)
                  </label>
                  <Input
                    type="number"
                    value={dailyGoals.water}
                    onChange={(e) => setDailyGoal('water', parseInt(e.target.value))}
                    min={0}
                    max={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sleep (hours)
                  </label>
                  <Input
                    type="number"
                    value={dailyGoals.sleep}
                    onChange={(e) => setDailyGoal('sleep', parseInt(e.target.value))}
                    min={0}
                    max={24}
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <HealthQuest />
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedHealthDashboard;