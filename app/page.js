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
    healthQuestDashboard: 'Know Your Kidney!',
    selectLanguage: 'Select Language',
    enterYourName: 'Enter your name',
    selectGender: 'Select Gender',
    male: 'Male',
    female: 'Female',
    age: 'Age',
    weightKg: 'Weight (kg)',
    heightCm: 'Height (cm)',
    activityLevel: 'Activity Level',
    sedentary: 'Sedentary',
    moderate: 'Moderate',
    active: 'Active',
    calculate: 'Calculate',
    yourResults: 'Your Results',
    bmi: 'BMI',
    bmr: 'BMR',
    dailyCalorieNeeds: 'Daily Calorie Needs',
    dailyNutrientNeeds: 'Daily Nutrient Needs',
    protein: 'Protein',
    fat: 'Fat',
    carbohydrates: 'Carbohydrates',
    sodium: 'Sodium',
    water: 'Water',
    liters: 'liters',
    waterConsumptionStrategy: 'Water Consumption Strategy',
    learnAboutKidneyFailure: 'Learn about Kidney Failure',
    kidneyFailureDescription: 'Kidney failure is a condition where the kidneys can no longer filter waste and excess fluids from the blood. In children, this condition can be acute (sudden) or chronic (long-term).',
    symptoms: 'Symptoms',
    highBloodPressure: 'High blood pressure',
    weightLoss: 'Weight loss or slowed growth',
    edema: 'Edema (swelling), especially around eyes, feet, or ankles',
    fatigue: 'Fatigue or lethargy',
    nausea: 'Nausea and vomiting',
    urinaryChanges: 'Frequent or reduced urination',
    bloodInUrine: 'Blood or foam in urine',
    prevention: 'Prevention',
    manageConditions: 'Manage underlying conditions like diabetes or hypertension',
    avoidMedications: 'Avoid using medications without doctor\'s supervision',
    consumeWater: 'Consume adequate water',
    regularCheckups: 'Regular kidney health check-ups, especially if there\'s a family history',
    complications: 'Complications',
    heartDamage: 'Heart or blood vessel damage',
    anemia: 'Anemia',
    boneDamage: 'Bone damage or mineral disorders',
    electrolyteImbalances: 'Electrolyte imbalances, such as hyperkalemia',
    suddenDeath: 'Sudden death',
    fillFieldsCorrectly: 'Please fill all fields correctly before calculating.',
    severeUnderweight: 'Severe underweight',
    mildUnderweight: 'Mild underweight',
    normal: 'Normal',
    mildOverweight: 'Mild overweight',
    severeOverweight: 'Severe overweight',
    bmiLowerThanAverage: 'Your BMI ({{bmi}}) is lower than the world average of {{worldAverage}}. You\'re in better shape than many people globally!',
    bmiHigherThanAverage: 'Your BMI ({{bmi}}) is higher than the world average of {{worldAverage}}. There\'s room for improvement, but remember, BMI isn\'t everything!',
    bmiExactlyAverage: 'Your BMI ({{bmi}}) is exactly the world average. What are the odds?',
    waterStrategy: 'Based on your weight, you need about {{waterNeed}} liters of water per day. This is equivalent to about {{glassesNeeded}} glasses of water. Try to drink about {{hourlyGlasses}} glasses every hour you\'re awake.',
    nameRequired: 'Name is required',
    ageRange: 'Age must be between 1 and 120',
    weightRange: 'Weight must be between 1 and 500 kg',
    heightRange: 'Height must be between 1 and 300 cm'
  },
  id: {
    healthQuestDashboard: 'Sadar Ginjal Yuk!',
    selectLanguage: 'Pilih Bahasa',
    enterYourName: 'Masukkan nama Anda',
    selectGender: 'Pilih Jenis Kelamin',
    male: 'Laki-laki',
    female: 'Perempuan',
    age: 'Usia',
    weightKg: 'Berat (kg)',
    heightCm: 'Tinggi (cm)',
    activityLevel: 'Tingkat Aktivitas',
    sedentary: 'Jarang Bergerak',
    moderate: 'Sedang',
    active: 'Aktif',
    calculate: 'Hitung',
    yourResults: 'Hasil Anda',
    bmi: 'IMT',
    bmr: 'BMR',
    dailyCalorieNeeds: 'Kebutuhan Kalori Harian',
    dailyNutrientNeeds: 'Kebutuhan Nutrisi Harian',
    protein: 'Protein',
    fat: 'Lemak',
    carbohydrates: 'Karbohidrat',
    sodium: 'Sodium',
    water: 'Air',
    liters: 'liter',
    waterConsumptionStrategy: 'Strategi Konsumsi Air',
    learnAboutKidneyFailure: 'Pelajari tentang Gagal Ginjal',
    kidneyFailureDescription: 'Gagal ginjal adalah kondisi di mana ginjal tidak lagi dapat menyaring limbah dan cairan berlebih dari darah. Pada anak-anak, kondisi ini bisa akut (tiba-tiba) atau kronis (jangka panjang).',
    symptoms: 'Gejala',
    highBloodPressure: 'Tekanan darah tinggi',
    weightLoss: 'Penurunan berat badan atau pertumbuhan yang lambat',
    edema: 'Edema (pembengkakan), terutama di sekitar mata, kaki, atau pergelangan kaki',
    fatigue: 'Kelelahan atau lesu',
    nausea: 'Mual dan muntah',
    urinaryChanges: 'Buang air kecil yang sering atau berkurang',
    bloodInUrine: 'Darah atau busa dalam urin',
    prevention: 'Pencegahan',
    manageConditions: 'Mengelola kondisi yang mendasari seperti diabetes atau hipertensi',
    avoidMedications: 'Hindari penggunaan obat-obatan tanpa pengawasan dokter',
    consumeWater: 'Konsumsi air yang cukup',
    regularCheckups: 'Pemeriksaan kesehatan ginjal rutin, terutama jika ada riwayat keluarga',
    complications: 'Komplikasi',
    heartDamage: 'Kerusakan jantung atau pembuluh darah',
    anemia: 'Anemia',
    boneDamage: 'Kerusakan tulang atau gangguan mineral',
    electrolyteImbalances: 'Ketidakseimbangan elektrolit, seperti hiperkalemia',
    suddenDeath: 'Kematian mendadak',
    fillFieldsCorrectly: 'Harap isi semua kolom dengan benar sebelum menghitung.',
    severeUnderweight: 'Kekurangan berat badan parah',
    mildUnderweight: 'Kekurangan berat badan ringan',
    normal: 'Normal',
    mildOverweight: 'Kelebihan berat badan ringan',
    severeOverweight: 'Kelebihan berat badan parah',
    bmiLowerThanAverage: 'IMT Anda ({{bmi}}) lebih rendah dari rata-rata dunia {{worldAverage}}. Anda dalam kondisi lebih baik dari banyak orang di dunia!',
    bmiHigherThanAverage: 'IMT Anda ({{bmi}}) lebih tinggi dari rata-rata dunia {{worldAverage}}. Masih ada ruang untuk perbaikan, tapi ingat, IMT bukan segalanya!',
    bmiExactlyAverage: 'IMT Anda ({{bmi}}) tepat sama dengan rata-rata dunia. Apa kemungkinannya?',
    waterStrategy: 'Berdasarkan berat badan Anda, Anda membutuhkan sekitar {{waterNeed}} liter air per hari. Ini setara dengan sekitar {{glassesNeeded}} gelas air. Cobalah untuk minum sekitar {{hourlyGlasses}} gelas setiap jam Anda terjaga.',
    nameRequired: 'Nama wajib diisi',
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