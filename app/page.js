"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Droplet, Heart, Sun, Moon, ChevronDown, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const weeklyActivityData = [
  { day: 'Monday', minutes: 30 },
  { day: 'Tuesday', minutes: 45 },
  { day: 'Wednesday', minutes: 60 },
  { day: 'Thursday', minutes: 50 },
  { day: 'Friday', minutes: 40 },
  { day: 'Saturday', minutes: 70 },
  { day: 'Sunday', minutes: 30 },
];

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 animate-gradient-x"></div>
    <div className="absolute inset-0 bg-[url('/path/to/pattern.svg')] opacity-10"></div>
  </div>
);

const HealthQuestDashboard = () => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState('en');
  const [userData, setUserData] = useState({
    name: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
  });
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [healthTip, setHealthTip] = useState('');
  const [questProgress, setQuestProgress] = useState(0);
  const [theme, setTheme] = useState('light');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
    validateField(name, value);
    updateQuestProgress();
  };

  const handleSelectChange = (name, value) => {
    setUserData((prevData) => ({ ...prevData, [name]: value }));
    validateField(name, value);
    updateQuestProgress();
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    switch (name) {
      case 'name':
        if (value.trim() === '') {
          newErrors.name = t('nameRequired');
        } else {
          delete newErrors.name;
        }
        break;
      case 'age':
        if (value <= 0 || value > 120) {
          newErrors.age = t('ageRange');
        } else {
          delete newErrors.age;
        }
        break;
      case 'weight':
        if (value <= 0 || value > 500) {
          newErrors.weight = t('weightRange');
        } else {
          delete newErrors.weight;
        }
        break;
      case 'height':
        if (value <= 0 || value > 300) {
          newErrors.height = t('heightRange');
        } else {
          delete newErrors.height;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const updateQuestProgress = () => {
    const totalFields = Object.keys(userData).length;
    const filledFields = Object.values(userData).filter((value) => value !== '').length;
    setQuestProgress((filledFields / totalFields) * 100);
  };

  const calculateHealth = () => {
    if (Object.keys(errors).length > 0 || Object.values(userData).some((value) => value === '')) {
      setResults(null);
      setHealthTip(t('fillFieldsCorrectly'));
      return;
    }

    const { gender, age, weight, height, activityLevel } = userData;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let bmr;
    if (gender === 'male') {
      bmr = 66.5 + 13.7 * weight + 5 * height - 6.8 * age;
    } else {
      bmr = 655 + 9.6 * weight + 1.8 * height - 4.7 * age;
    }

    const activityMultipliers = { sedentary: 1.2, moderate: 1.3, active: 1.4 };
    const dailyCalories = bmr * activityMultipliers[activityLevel];
    const proteinNeed = weight * 0.8;
    const fatNeed = (dailyCalories * 0.3) / 9;
    const carbNeed = (dailyCalories - (proteinNeed * 4 + fatNeed * 9)) / 4;
    const waterNeed = weight * 0.033;

    let bmiCategory;
    if (bmi < 18.5) bmiCategory = t('underweight');
    else if (bmi < 25) bmiCategory = t('normal');
    else if (bmi < 30) bmiCategory = t('overweight');
    else bmiCategory = t('obese');

    const newResults = {
      bmi: bmi.toFixed(1),
      bmiCategory,
      bmr: Math.round(bmr),
      dailyCalories: Math.round(dailyCalories),
      proteinNeed: Math.round(proteinNeed),
      fatNeed: Math.round(fatNeed),
      carbNeed: Math.round(carbNeed),
      waterNeed: waterNeed.toFixed(1),
    };

    setResults(newResults);
    setHealthTip(getRandomHealthTip());
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const getRandomHealthTip = () => {
    const tips = [
      t('healthTip1'),
      t('healthTip2'),
      t('healthTip3'),
      t('healthTip4'),
      t('healthTip5'),
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const ResultsDisplay = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
        <Trophy className="mr-3 text-yellow-400" />
        {t('yourResults')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="p-0">
            <h4 className="text-xl font-semibold">{t('bmi')}</h4>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <p className="text-4xl font-bold">{results.bmi}</p>
            <p className="text-lg mt-2">{results.bmiCategory}</p>
          </CardContent>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="p-0">
            <h4 className="text-xl font-semibold">{t('dailyCalorieNeeds')}</h4>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <p className="text-4xl font-bold">{results.dailyCalories}</p>
            <p className="text-lg mt-2">{t('calories')}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 p-6 bg-white dark:bg-gray-800">
        <CardHeader className="p-0">
          <h4 className="text-2xl font-semibold">{t('dailyNutrientNeeds')}</h4>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">{t('protein')}</p>
              <p className="text-2xl font-semibold mt-2">{results.proteinNeed}g</p>
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">{t('fat')}</p>
              <p className="text-2xl font-semibold mt-2">{results.fatNeed}g</p>
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">{t('carbohydrates')}</p>
              <p className="text-2xl font-semibold mt-2">{results.carbNeed}g</p>
            </div>
          </div>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Protein', value: results.proteinNeed },
                    { name: 'Fat', value: results.fatNeed },
                    { name: 'Carbs', value: results.carbNeed },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#FF6384" />
                  <Cell fill="#36A2EB" />
                  <Cell fill="#FFCE56" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6 p-6 bg-blue-50 dark:bg-blue-900">
        <CardHeader className="p-0">
          <h4 className="text-2xl font-semibold flex items-center">
            <Droplet className="mr-3" /> {t('waterNeeds')}
          </h4>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <p className="text-4xl font-bold">{results.waterNeed} {t('liters')}</p>
          <p className="text-lg mt-4">{waterStrategy}</p>
          <div className="mt-4 flex justify-center">
            {[...Array(Math.ceil(results.waterNeed / 0.25))].map((_, i) => (
              <Droplet key={i} className="text-blue-500 mx-1" size={24} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6 p-6 bg-green-50 dark:bg-green-900">
        <CardHeader className="p-0">
          <h4 className="text-2xl font-semibold flex items-center">
            <Heart className="mr-3" /> {t('healthTip')}
          </h4>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <p className="text-lg">{healthTip}</p>
        </CardContent>
      </Card>
      <Card className="mt-6 p-6">
        <CardHeader className="p-0">
          <h4 className="text-2xl font-semibold">{t('weeklyActivityGoal')}</h4>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="minutes" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  return (
    <div className={`relative min-h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      <AnimatedBackground />
      <div className="relative z-10 p-8">
        <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">{t('healthQuestDashboard')}</h1>
              <div className="flex items-center space-x-4">
                <Select onValueChange={handleLanguageChange} value={language}>
                  <SelectTrigger className="w-[180px] bg-white text-black">
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={toggleTheme} variant="outline" size="icon">
                  {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-semibold mb-6">{t('startYourQuest')}</h2>
              <Progress value={questProgress} className="mb-4 h-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{t('questProgress', { progress: Math.round(questProgress) })}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  name="name"
                  type="text"
                  placeholder={t('enterYourName')}
                  value={userData.name}
                  onChange={handleInputChange}
                  className="col-span-1 md:col-span-2 dark:border-gray-600 dark:focus:border-white dark:focus:ring-white"
                />
                <Select onValueChange={(value) => handleSelectChange('gender', value)}>
                  <SelectTrigger className="dark:border-gray-600 dark:focus:border-white dark:focus:ring-white">
                    <SelectValue placeholder={t('selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('male')}</SelectItem>
                    <SelectItem value="female">{t('female')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  name="age"
                  type="number"
                  placeholder={t('age')}
                  value={userData.age}
                  onChange={handleInputChange}
                  className="dark:border-gray-600 dark:focus:border-white dark:focus:ring-white"
                />
                <Input
                  name="weight"
                  type="number"
                  placeholder={t('weightKg')}
                  value={userData.weight}
                  onChange={handleInputChange}
                  className="dark:border-gray-600 dark:focus:border-white dark:focus:ring-white"
                />
                <Input
                  name="height"
                  type="number"
                  placeholder={t('heightCm')}
                  value={userData.height}
                  onChange={handleInputChange}
                  className="dark:border-gray-600 dark:focus:border-white dark:focus:ring-white"
                />
                <Select onValueChange={(value) => handleSelectChange('activityLevel', value)}>
                  <SelectTrigger className="dark:border-gray-600 dark:focus:border-white dark:focus:ring-white">
                    <SelectValue placeholder={t('activityLevel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">{t('sedentary')}</SelectItem>
                    <SelectItem value="moderate">{t('moderate')}</SelectItem>
                    <SelectItem value="active">{t('active')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {Object.keys(errors).map((key) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center text-red-500 mb-2"
                >
                  <AlertCircle className="mr-2" />
                  {errors[key]}
                </motion.div>
              ))}
              <Button
                onClick={calculateHealth}
                className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                {t('startAdventure')}
              </Button>

              <AnimatePresence>{results && <ResultsDisplay />}</AnimatePresence>
            </motion.div>
          </CardContent>
        </Card>
      </div>
      <footer className="bg-gray-800 text-white text-center py-6 mt-12">
        <p>© 2024 Atania Health Quest Dashboard. All rights reserved.</p>
        <p className="mt-2">Designed with ❤️ for your well-being</p>
      </footer>
      {showConfetti && <Confetti />}
    </div>
  );
};

const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
    const newParticles = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20,
      size: Math.random() * 8 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 1,
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            y: particle.y + particle.speed,
          }))
          .filter((particle) => particle.y < window.innerHeight)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
          }}
        />
      ))}
    </div>
  );
};

// Translations
const translations = {
  en: {
    healthQuestDashboard: 'Health and Kidney Awareness Dashboard',
    selectLanguage: 'Select Language',
    startYourQuest: 'Begin Your Health Assessment',
    questProgress: 'Form Completion: {{progress}}%',
    enterYourName: 'Enter your name',
    selectGender: 'Select your gender',
    male: 'Male',
    female: 'Female',
    age: 'Enter your age',
    weightKg: 'Your weight (kg)',
    heightCm: 'Your height (cm)',
    activityLevel: 'Select your activity level',
    sedentary: 'Sedentary',
    moderate: 'Moderately Active',
    active: 'Very Active',
    startAdventure: 'Calculate My Health Metrics',
    yourResults: 'Your Health Assessment Results',
    bmi: 'Body Mass Index (BMI)',
    bmr: 'Basal Metabolic Rate (BMR)',
    dailyCalorieNeeds: 'Daily Calorie Needs',
    calories: 'calories',
    dailyNutrientNeeds: 'Daily Nutrient Needs',
    protein: 'Protein',
    fat: 'Healthy Fats',
    carbohydrates: 'Carbohydrates',
    waterNeeds: 'Daily Water Needs',
    liters: 'liters',
    healthTip: 'Health Tip of the Day',
    learnAboutKidneyHealth: 'Learn About Kidney Health',
    kidneyHealthDescription: 'Your kidneys play a crucial role in maintaining overall health by filtering blood, balancing fluids, and supporting various bodily functions.',
    kidneyHealthTips: 'Kidney Health Tips',
    stayHydrated: 'Stay well-hydrated by drinking plenty of water',
    eatHealthy: 'Maintain a balanced diet rich in fruits, vegetables, and whole grains',
    exerciseRegularly: 'Engage in regular physical activity',
    avoidSmoking: 'Avoid smoking and limit alcohol consumption',
    limitAlcohol: 'Consume alcohol in moderation',
    regularCheckups: 'Schedule regular health check-ups',
    fillFieldsCorrectly: 'Please fill in all fields correctly to calculate your health metrics.',
    underweight: 'Underweight',
    normal: 'Normal weight',
    overweight: 'Overweight',
    obese: 'Obese',
    waterStrategy: 'For proper hydration, aim to drink {{waterNeed}} liters of water daily. This is approximately {{glassesNeeded}} glasses. Try to drink {{hourlyGlasses}} glass(es) every hour while you\'re awake.',
    healthTip1: 'Regular laughter can boost your mood and immune system.',
    healthTip2: 'Aim for 7-9 hours of sleep each night for optimal health.',
    healthTip3: 'Strong social connections can positively impact your overall well-being.',
    healthTip4: 'Practice mindfulness or meditation to reduce stress and improve mental health.',
    healthTip5: 'Eating a variety of colorful fruits and vegetables provides essential nutrients and antioxidants.',
    nameRequired: 'Please enter your name.',
    ageRange: 'Please enter an age between 1 and 120 years.',
    weightRange: 'Please enter a weight between 1 and 500 kg.',
    heightRange: 'Please enter a height between 1 and 300 cm.'
  },
  id: {
    healthQuestDashboard: 'Dashboard Kesehatan dan Kesadaran Ginjal',
    selectLanguage: 'Pilih Bahasa',
    startYourQuest: 'Mulai Penilaian Kesehatan Anda',
    questProgress: 'Kelengkapan Formulir: {{progress}}%',
    enterYourName: 'Masukkan nama Anda',
    selectGender: 'Pilih jenis kelamin Anda',
    male: 'Laki-laki',
    female: 'Perempuan',
    age: 'Masukkan usia Anda',
    weightKg: 'Berat badan Anda (kg)',
    heightCm: 'Tinggi badan Anda (cm)',
    activityLevel: 'Pilih tingkat aktivitas Anda',
    sedentary: 'Jarang Bergerak',
    moderate: 'Cukup Aktif',
    active: 'Sangat Aktif',
    startAdventure: 'Hitung Metrik Kesehatan Saya',
    yourResults: 'Hasil Penilaian Kesehatan Anda',
    bmi: 'Indeks Massa Tubuh (IMT)',
    bmr: 'Laju Metabolisme Basal (BMR)',
    dailyCalorieNeeds: 'Kebutuhan Kalori Harian',
    calories: 'kalori',
    dailyNutrientNeeds: 'Kebutuhan Nutrisi Harian',
    protein: 'Protein',
    fat: 'Lemak Sehat',
    carbohydrates: 'Karbohidrat',
    waterNeeds: 'Kebutuhan Air Harian',
    liters: 'liter',
    healthTip: 'Tips Kesehatan Hari Ini',
    learnAboutKidneyHealth: 'Pelajari Tentang Kesehatan Ginjal',
    kidneyHealthDescription: 'Ginjal Anda memainkan peran penting dalam menjaga kesehatan secara keseluruhan dengan menyaring darah, menyeimbangkan cairan, dan mendukung berbagai fungsi tubuh.',
    kidneyHealthTips: 'Tips Kesehatan Ginjal',
    stayHydrated: 'Jaga hidrasi dengan minum banyak air',
    eatHealthy: 'Pertahankan pola makan seimbang kaya buah, sayuran, dan biji-bijian utuh',
    exerciseRegularly: 'Lakukan aktivitas fisik secara teratur',
    avoidSmoking: 'Hindari merokok dan batasi konsumsi alkohol',
    limitAlcohol: 'Konsumsi alkohol secukupnya',
    regularCheckups: 'Lakukan pemeriksaan kesehatan rutin',
    fillFieldsCorrectly: 'Harap isi semua kolom dengan benar untuk menghitung metrik kesehatan Anda.',
    underweight: 'Berat badan kurang',
    normal: 'Berat badan normal',
    overweight: 'Kelebihan berat badan',
    obese: 'Obesitas',
    waterStrategy: 'Untuk hidrasi yang baik, targetkan untuk minum {{waterNeed}} liter air setiap hari. Ini sekitar {{glassesNeeded}} gelas. Cobalah minum {{hourlyGlasses}} gelas setiap jam selama Anda terjaga.',
    healthTip1: 'Tertawa secara teratur dapat meningkatkan suasana hati dan sistem kekebalan tubuh Anda.',
    healthTip2: 'Usahakan tidur 7-9 jam setiap malam untuk kesehatan optimal.',
    healthTip3: 'Hubungan sosial yang kuat dapat berdampak positif pada kesejahteraan Anda secara keseluruhan.',
    healthTip4: 'Praktikkan mindfulness atau meditasi untuk mengurangi stres dan meningkatkan kesehatan mental.',
    healthTip5: 'Mengonsumsi berbagai buah dan sayuran berwarna-warni memberikan nutrisi dan antioksidan penting.',
    nameRequired: 'Mohon masukkan nama Anda.',
    ageRange: 'Mohon masukkan usia antara 1 dan 120 tahun.',
    weightRange: 'Mohon masukkan berat badan antara 1 dan 500 kg.',
    heightRange: 'Mohon masukkan tinggi badan antara 1 dan 300 cm.'
  }
};

// i18n configuration
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default HealthQuestDashboard;   