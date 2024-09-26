import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@shadcn/ui/card';
import { Alert, AlertDescription, AlertTitle, AlertDialog, AlertDialogAction } from '@shadcn/ui/alert';
import { v4 as uuidv4 } from 'uuid';

const HealthDashboardChatbot = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    weight: null,
    height: null,
    age: null,
    gender: null,
    activityLevel: null,
  });
  const [bmi, setBmi] = useState(null);
  const [bmr, setBmr] = useState(null);
  const [macros, setMacros] = useState({
    protein: null,
    fat: null,
    carbs: null,
  });
  const [showSummary, setShowSummary] = useState(false);

  const steps = [
    {
      title: 'Weight and Height',
      component: (
        <UserDataInput
          field="weight"
          label="Weight (kg)"
          value={userData.weight}
          onChange={(value) => handleUserDataChange('weight', value)}
        />
      ),
    },
    {
      title: 'Age and Gender',
      component: (
        <UserDataInput
          field="age"
          label="Age"
          value={userData.age}
          onChange={(value) => handleUserDataChange('age', value)}
        />
      ),
    },
    {
      title: 'Activity Level',
      component: (
        <UserDataInput
          field="activityLevel"
          label="Activity Level"
          value={userData.activityLevel}
          onChange={(value) => handleUserDataChange('activityLevel', value)}
        />
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

  const calculateBmi = () => {
    const { weight, height } = userData;
    const bmi = weight / (height * height);
    setBmi(bmi.toFixed(1));
  };

  const calculateBmr = () => {
    const { weight, height, age, gender, activityLevel } = userData;
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.33 * age);
    }
    bmr *= activityLevelMultiplier[activityLevel];
    setBmr(Math.round(bmr));
  };

  const calculateMacros = () => {
    const proteinRatio = 0.25;
    const fatRatio = 0.25;
    const carbsRatio = 0.50;

    const protein = Math.round(bmr * proteinRatio / 4);
    const fat = Math.round(bmr * fatRatio / 9);
    const carbs = Math.round(bmr * carbsRatio / 4);

    setMacros({ protein, fat, carbs });
  };

  const activityLevelMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  const handleUserDataChange = (field, value) => {
    setUserData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

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
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Health Dashboard Chatbot</h1>
      </header>
      <main className="flex-1 p-6">
        {!showSummary ? (
          <div className="space-y-6">
            <ChatbotStep
              title={steps[currentStep].title}
              component={steps[currentStep].component}
              onNext={handleNextStep}
            />
          </div>
        ) : (
          <HealthSummary
            bmi={bmi}
            bmr={bmr}
            macros={macros}
            userData={userData}
          />
        )}
      </main>
    </div>
  );
};

const ChatbotStep = ({ title, component, onNext }) => {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>
        {component}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          onClick={onNext}
        >
          Next
        </button>
      </CardContent>
    </Card>
  );
};

const UserDataInput = ({ field, label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={field} className="block font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        id={field}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 w-full"
      />
    </div>
  );
};

const HealthSummary = ({ bmi, bmr, macros, userData }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>Body Mass Index (BMI)</CardHeader>
        <CardContent>
          <p>
            Your BMI is <strong>{bmi}</strong>, which is considered{' '}
            {getBmiCategory(bmi)}.
          </p>
          <p>
            {getBmiDescription(bmi)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Basal Metabolic Rate (BMR) & Daily Calorie Needs</CardHeader>
        <CardContent>
          <p>
            Your estimated BMR is <strong>{bmr} kcal/day</strong>. To maintain your
            current weight, you should aim to consume approximately{' '}
            <strong>{Math.round(bmr * activityLevelMultiplier[userData.activityLevel])} kcal/day</strong>.
          </p>
          <p>
            Recommended macronutrient intake:
            <ul>
              <li>Protein: <strong>{macros.protein}g/day</strong></li>
              <li>Fats: <strong>{macros.fat}g/day</strong></li>
              <li>Carbohydrates: <strong>{macros.carbs}g/day</strong></li>
            </ul>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Next Steps for a Healthy Life</CardHeader>
        <CardContent>
          <ul>
            <li>Maintain a varied diet with the right mix of proteins, fats, and carbohydrates.</li>
            <li>Aim for regular physical activity to boost metabolism and maintain weight.</li>
            <li>Don't forget to stay hydrated—water is key for metabolism and kidney function.</li>
          </ul>
        </CardContent>
      </Card>
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
    return 'You are in the obese range. It's important to make changes to your diet and exercise routine to improve your health.';
  }
};

export default HealthDashboardChatbot;