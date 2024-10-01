"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Droplet, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 animate-gradient-x"></div>
  </div>
);

const HealthQuestDashboard = () => {
  const { t, i18n } = useTranslation();
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
  const [waterStrategy, setWaterStrategy] = useState('');
  const [questProgress, setQuestProgress] = useState(0);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
    validateField(name, value);
    updateQuestProgress();
  };

  const handleSelectChange = (name, value) => {
    setUserData(prevData => ({ ...prevData, [name]: value }));
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
    const filledFields = Object.values(userData).filter(value => value !== '').length;
    setQuestProgress((filledFields / totalFields) * 100);
  };

  const calculateHealth = () => {
    if (Object.keys(errors).length > 0 || Object.values(userData).some(value => value === '')) {
      setResults(null);
      setHealthTip(t('fillFieldsCorrectly'));
      return;
    }

    const { gender, age, weight, height, activityLevel } = userData;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let bmr;
    if (gender === 'male') {
      bmr = 66.5 + (13.7 * weight) + (5 * height) - (6.8 * age);
    } else {
      bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
    }

    const activityMultipliers = { sedentary: 1.2, moderate: 1.3, active: 1.4 };
    const dailyCalories = bmr * activityMultipliers[activityLevel];
    const proteinNeed = weight * 0.8;
    const fatNeed = dailyCalories * 0.3 / 9;
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
    setWaterStrategy(t('waterStrategy', { 
      waterNeed: waterNeed.toFixed(1),
      glassesNeeded: Math.ceil(waterNeed / 0.25),
      hourlyGlasses: Math.ceil((waterNeed / 0.25) / 8)
    }));
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

  const ResultsDisplay = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-semibold mb-4">{t('yourResults')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader className="p-0">
            <h4 className="text-lg font-semibold">{t('bmi')}</h4>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <p className="text-3xl font-bold">{results.bmi}</p>
            <p className="text-sm text-gray-600">{results.bmiCategory}</p>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="p-0">
            <h4 className="text-lg font-semibold">{t('dailyCalorieNeeds')}</h4>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <p className="text-3xl font-bold">{results.dailyCalories}</p>
            <p className="text-sm text-gray-600">{t('calories')}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4 p-4">
        <CardHeader className="p-0">
          <h4 className="text-lg font-semibold">{t('dailyNutrientNeeds')}</h4>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-sm text-gray-600">{t('protein')}</p>
              <p className="text-lg font-semibold">{results.proteinNeed}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('fat')}</p>
              <p className="text-lg font-semibold">{results.fatNeed}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('carbohydrates')}</p>
              <p className="text-lg font-semibold">{results.carbNeed}g</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4 p-4 bg-blue-50">
        <CardHeader className="p-0">
          <h4 className="text-lg font-semibold flex items-center">
            <Droplet className="mr-2" /> {t('waterNeeds')}
          </h4>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          <p className="text-3xl font-bold">{results.waterNeed} {t('liters')}</p>
          <p className="text-sm mt-2">{waterStrategy}</p>
        </CardContent>
      </Card>
      <Card className="mt-4 p-4 bg-green-50">
        <CardHeader className="p-0">
          <h4 className="text-lg font-semibold flex items-center">
            <Heart className="mr-2" /> {t('healthTip')}
          </h4>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          <p>{healthTip}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 p-8">
        <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{t('healthQuestDashboard')}</h1>
              <Select onValueChange={handleLanguageChange} value={language}>
                <SelectTrigger className="w-[180px] bg-white text-black">
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4">{t('startYourQuest')}</h2>
              <Progress value={questProgress} className="mb-4" />
              <p className="text-sm text-gray-600 mb-4">{t('questProgress', { progress: Math.round(questProgress) })}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input 
                  name="name" 
                  type="text" 
                  placeholder={t('enterYourName')} 
                  value={userData.name} 
                  onChange={handleInputChange} 
                  className="col-span-1 md:col-span-2"
                />
                <Select onValueChange={(value) => handleSelectChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('male')}</SelectItem>
                    <SelectItem value="female">{t('female')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input name="age" type="number" placeholder={t('age')} onChange={handleInputChange} />
                <Input name="weight" type="number" placeholder={t('weightKg')} onChange={handleInputChange} />
                <Input name="height" type="number" placeholder={t('heightCm')} onChange={handleInputChange} />
                <Select onValueChange={(value) => handleSelectChange('activityLevel', value)}>
                  <SelectTrigger>
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
              <Button onClick={calculateHealth} className="w-full">{t('startAdventure')}</Button>

              <AnimatePresence>
                {results && <ResultsDisplay />}
              </AnimatePresence>

              <Accordion type="single" collapsible className="mt-8">
                <AccordionItem value="kidney-health">
                  <AccordionTrigger>{t('learnAboutKidneyHealth')}</AccordionTrigger>
                  <AccordionContent>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{t('kidneyHealthDescription')}</p>
                      <h4 className="font-semibold mt-2">{t('kidneyHealthTips')}</h4>
                      <ul className="list-disc pl-5">
                        <li>{t('stayHydrated')}</li>
                        <li>{t('eatHealthy')}</li>
                        <li>{t('exerciseRegularly')}</li>
                        <li>{t('avoidSmoking')}</li>
                        <li>{t('limitAlcohol')}</li>
                        <li>{t('regularCheckups')}</li>
                      </ul>
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              </motion.div>
          </CardContent>
        </Card>
    </div>
  </div>
  );
};

// Translations
const translations = {
  en: {
    healthQuestDashboard: 'Health Quest: Know Your Kidney!',
    selectLanguage: 'Select Language',
    startYourQuest: 'Start Your Health Quest',
    questProgress: 'Quest Progress: {{progress}}%',
    enterYourName: 'What\'s your name, brave adventurer?',
    selectGender: 'Choose your character',
    male: 'Male',
    female: 'Female',
    age: 'How many years have you journeyed?',
    weightKg: 'Your weight in kg (no judgement here!)',
    heightCm: 'Your height in cm (how tall are you?)',
    activityLevel: 'Choose your activity class',
    sedentary: 'Peaceful Villager',
    moderate: 'Town Guard',
    active: 'Heroic Adventurer',
    startAdventure: 'Begin Your Health Quest!',
    yourResults: 'Your Quest Results',
    bmi: 'Body Magic Index',
    bmr: 'Base Magic Rate',
    dailyCalorieNeeds: 'Daily Energy Potion',
    calories: 'magic points',
    dailyNutrientNeeds: 'Adventurer\'s Rations',
    protein: 'Protein',
    fat: 'Healthy Fats',
    carbohydrates: 'Energy Carbs',
    waterNeeds: 'Hydration Potion',
    liters: 'magical liters',
    healthTip: 'Wise Sage\'s Advice',
    learnAboutKidneyHealth: 'Secrets of the Kidney Guardians',
    kidneyHealthDescription: 'Your kidneys are the silent guardians of your body\'s realm. They work tirelessly to filter your blood, maintain fluid balance, and support overall health.',
    kidneyHealthTips: 'Kidney Guardian\'s Wisdom',
    stayHydrated: 'Drink plenty of water, the elixir of life',
    eatHealthy: 'Feast on fruits, vegetables, and whole grains',
    exerciseRegularly: 'Train your body with regular physical activity',
    avoidSmoking: 'Avoid the smoke dragon\'s temptation',
    limitAlcohol: 'Consume magical potions (alcohol) in moderation',
    regularCheckups: 'Visit the health sage for regular check-ups',
    fillFieldsCorrectly: 'Brave adventurer, please fill all fields correctly before we can calculate your health stats!',
    underweight: 'Light as a feather',
    normal: 'Perfectly balanced',
    overweight: 'Carrying extra treasure',
    obese: 'Blessed with abundance',
    waterStrategy: 'To stay properly hydrated, aim for {{waterNeed}} liters of water per day. That\'s about {{glassesNeeded}} glasses of the life-giving elixir. Try to drink {{hourlyGlasses}} glass(es) every hour you\'re awake on your adventure!',
    healthTip1: 'Remember, laughter is the best medicine! Find joy in your daily adventures.',
    healthTip2: 'A good night\'s sleep is like a healing potion for your body and mind.',
    healthTip3: 'Friendship is a powerful spell. Nurture your relationships for better health.',
    healthTip4: 'Meditation is like training your mind to resist dark magic. Practice it daily!',
    healthTip5: 'Eating colorful fruits and veggies is like casting a protection spell on your body.',
    nameRequired: 'Every hero needs a name!',
    ageRange: 'Age must be between 1 and 120 years',
    weightRange: 'Weight must be between 1 and 500 kg',
    heightRange: 'Height must be between 1 and 300 cm'
  },
  id: {
    healthQuestDashboard: 'Petualangan Sehat: Kenali Ginjalmu!',
    selectLanguage: 'Pilih Bahasa',
    startYourQuest: 'Mulai Petualangan Sehatmu',
    questProgress: 'Kemajuan Petualangan: {{progress}}%',
    enterYourName: 'Siapa namamu, pejuang pemberani?',
    selectGender: 'Pilih karaktermu',
    male: 'Laki-laki',
    female: 'Perempuan',
    age: 'Berapa tahun perjalananmu?',
    weightKg: 'Berat badanmu dalam kg (tanpa penilaian!)',
    heightCm: 'Tinggi badanmu dalam cm (seberapa tinggi kamu?)',
    activityLevel: 'Pilih kelas aktivitasmu',
    sedentary: 'Penduduk Desa Damai',
    moderate: 'Penjaga Kota',
    active: 'Petualang Heroik',
    startAdventure: 'Mulai Petualangan Sehatmu!',
    yourResults: 'Hasil Petualanganmu',
    bmi: 'Indeks Sihir Tubuh',
    bmr: 'Tingkat Sihir Dasar',
    dailyCalorieNeeds: 'Ramuan Energi Harian',
    calories: 'poin sihir',
    dailyNutrientNeeds: 'Ransum Petualang',
    protein: 'Protein',
    fat: 'Lemak Sehat',
    carbohydrates: 'Karbohidrat Energi',
    waterNeeds: 'Ramuan Hidrasi',
    liters: 'liter ajaib',
    healthTip: 'Nasihat Bijak Sang Pertapa',
    learnAboutKidneyHealth: 'Rahasia Para Penjaga Ginjal',
    kidneyHealthDescription: 'Ginjalmu adalah penjaga sunyi alam tubuhmu. Mereka bekerja tanpa lelah untuk menyaring darahmu, menjaga keseimbangan cairan, dan mendukung kesehatan secara keseluruhan.',
    kidneyHealthTips: 'Kebijaksanaan Penjaga Ginjal',
    stayHydrated: 'Minum banyak air, ramuan kehidupan',
    eatHealthy: 'Berpesta dengan buah-buahan, sayuran, dan biji-bijian utuh',
    exerciseRegularly: 'Latih tubuhmu dengan aktivitas fisik teratur',
    avoidSmoking: 'Hindari godaan naga asap',
    limitAlcohol: 'Konsumsi ramuan ajaib (alkohol) secukupnya',
    regularCheckups: 'Kunjungi tabib kesehatan untuk pemeriksaan rutin',
    fillFieldsCorrectly: 'Pejuang pemberani, harap isi semua kolom dengan benar sebelum kami dapat menghitung statistik kesehatanmu!',
    underweight: 'Ringan bagai bulu',
    normal: 'Sempurna seimbang',
    overweight: 'Membawa harta ekstra',
    obese: 'Diberkati dengan kelimpahan',
    waterStrategy: 'Untuk tetap terhidrasi dengan baik, targetkan {{waterNeed}} liter air per hari. Itu sekitar {{glassesNeeded}} gelas ramuan pemberi kehidupan. Cobalah minum {{hourlyGlasses}} gelas setiap jam kamu terjaga dalam petualanganmu!',
    healthTip1: 'Ingat, tawa adalah obat terbaik! Temukan kegembiraan dalam petualangan harianmu.',
    healthTip2: 'Tidur nyenyak di malam hari seperti ramuan penyembuh untuk tubuh dan pikiranmu.',
    healthTip3: 'Persahabatan adalah mantra yang kuat. Pelihara hubunganmu untuk kesehatan yang lebih baik.',
    healthTip4: 'Meditasi seperti melatih pikiranmu untuk menolak sihir hitam. Praktikkan setiap hari!',
    healthTip5: 'Makan buah dan sayuran berwarna-warni seperti merapal mantra perlindungan pada tubuhmu.',
    nameRequired: 'Setiap pahlawan membutuhkan nama!',
    ageRange: 'Usia harus antara 1 dan 120 tahun',
    weightRange: 'Berat harus antara 1 dan 500 kg',
    heightRange: 'Tinggi harus antara 1 dan 300 cm'
  }
};

// i18n configuration
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      id: { translation: translations.id }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default HealthQuestDashboard;      