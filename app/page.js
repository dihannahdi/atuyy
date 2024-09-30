import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';

const GamifiedHealthDashboard = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState('en');

  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  
  const [userData, setUserData] = useState({
    gender: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [funFact, setFunFact] = useState('');
  const [waterStrategy, setWaterStrategy] = useState('');

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleNameSubmit = () => {
    if (name.trim() !== '') {
      setShowNameInput(false);
    }
  };

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
    // ... (validation logic remains the same)
  };

  const calculateHealth = () => {
    if (Object.keys(errors).length > 0 || Object.values(userData).some(value => value === '')) {
      setResults(null);
      setFunFact(t('fillFieldsCorrectly'));
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
    const proteinNeed = weight * 0.8;
    const fatNeed = dailyCalories * 0.3 / 9;
    const carbNeed = (dailyCalories - (proteinNeed * 4 + fatNeed * 9)) / 4;
    const sodiumNeed = 2300;
    const waterNeed = weight * 0.033;

    // Determine BMI category
    let bmiCategory;
    if (bmi < 17.0) bmiCategory = t('severeUnderweight');
    else if (bmi < 18.5) bmiCategory = t('mildUnderweight');
    else if (bmi <= 25.0) bmiCategory = t('normal');
    else if (bmi <= 27.0) bmiCategory = t('mildOverweight');
    else bmiCategory = t('severeOverweight');

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

    // Generate fun fact and water strategy
    const worldAverageBMI = 26.6;
    if (bmi < worldAverageBMI) {
      setFunFact(t('bmiLowerThanAverage', { bmi: bmi.toFixed(1), worldAverage: worldAverageBMI }));
    } else if (bmi > worldAverageBMI) {
      setFunFact(t('bmiHigherThanAverage', { bmi: bmi.toFixed(1), worldAverage: worldAverageBMI }));
    } else {
      setFunFact(t('bmiExactlyAverage', { bmi: bmi.toFixed(1) }));
    }

    const waterStrategyText = t('waterStrategy', { 
      waterNeed: waterNeed.toFixed(1),
      glassesNeeded: Math.ceil(waterNeed / 0.25),
      hourlyGlasses: Math.ceil((waterNeed / 0.25) / 8)
    });
    setWaterStrategy(waterStrategyText);
  };

  const ResultsDisplay = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-semibold mb-4">{t('yourResults')}</h3>
      <motion.p 
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-2"
      >
        {t('bmi')}: {results.bmi} ({results.bmiCategory})
      </motion.p>
      <motion.p 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t('bmr')}: {results.bmr} kcal
      </motion.p>
      <motion.p 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {t('dailyCalorieNeeds')}: {results.dailyCalories} kcal
      </motion.p>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h4 className="font-semibold mt-4 mb-2">{t('dailyNutrientNeeds')}</h4>
        <ul>
          <li>{t('protein')}: {results.proteinNeed}g</li>
          <li>{t('fat')}: {results.fatNeed}g</li>
          <li>{t('carbohydrates')}: {results.carbNeed}g</li>
          <li>{t('sodium')}: {results.sodiumNeed}mg</li>
          <li>{t('water')}: {results.waterNeed} {t('liters')}</li>
        </ul>
      </motion.div>
      {funFact && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 p-4 bg-blue-100 rounded-lg"
        >
          <p>{funFact}</p>
        </motion.div>
      )}
      {waterStrategy && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 p-4 bg-green-100 rounded-lg"
        >
          <h4 className="font-semibold mb-2">{t('waterConsumptionStrategy')}</h4>
          <p>{waterStrategy}</p>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 p-8">
      <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t('healthQuestDashboard')}</h1>
            <Select onValueChange={handleLanguageChange} value={language}>
              <SelectTrigger className="w-[180px]">
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
          <AnimatePresence>
            {showNameInput ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold mb-4">{t('welcomeMessage')}</h2>
                <Input
                  type="text"
                  placeholder={t('enterYourName')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-4"
                />
                <Button onClick={handleNameSubmit}>{t('submit')}</Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold mb-4">{t('welcomeUser', { name })}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                    className="text-red-500 mb-2"
                  >
                    {errors[key]}
                  </motion.div>
                ))}
                <Button onClick={calculateHealth}>{t('calculate')}</Button>

                <AnimatePresence>
                  {results && <ResultsDisplay />}
                </AnimatePresence>

                <Accordion type="single" collapsible className="mt-8">
                  <AccordionItem value="kidney-failure">
                    <AccordionTrigger>{t('learnAboutKidneyFailure')}</AccordionTrigger>
                    <AccordionContent>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>{t('kidneyFailureDescription')}</p>
                        <h4 className="font-semibold mt-2">{t('symptoms')}</h4>
                        <ul className="list-disc pl-5">
                          <li>{t('highBloodPressure')}</li>
                          <li>{t('weightLoss')}</li>
                          <li>{t('edema')}</li>
                          <li>{t('fatigue')}</li>
                          <li>{t('nausea')}</li>
                          <li>{t('urinaryChanges')}</li>
                          <li>{t('bloodInUrine')}</li>
                        </ul>
                        <h4 className="font-semibold mt-2">{t('prevention')}</h4>
                        <ul className="list-disc pl-5">
                          <li>{t('manageConditions')}</li>
                          <li>{t('avoidMedications')}</li>
                          <li>{t('consumeWater')}</li>
                          <li>{t('regularCheckups')}</li>
                        </ul>
                        <h4 className="font-semibold mt-2">{t('complications')}</h4>
                        <ul className="list-disc pl-5">
                          <li>{t('heartDamage')}</li>
                          <li>{t('anemia')}</li>
                          <li>{t('boneDamage')}</li>
                          <li>{t('electrolyteImbalances')}</li>
                          <li>{t('suddenDeath')}</li>
                        </ul>
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

// Translations
const translations = {
  en: {
    healthQuestDashboard: 'Health Quest Dashboard',
    selectLanguage: 'Select Language',
    welcomeMessage: 'Welcome to Health Quest!',
    enterYourName: 'Enter your name',
    submit: 'Submit',
    welcomeUser: 'Welcome, {{name}}!',
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
    waterStrategy: 'Based on your weight, you need about {{waterNeed}} liters of water per day. This is equivalent to about {{glassesNeeded}} glasses of water. Try to drink about {{hourlyGlasses}} glasses every hour you\'re awake.'
  },
  id: {
    healthQuestDashboard: 'Dashboard Pencarian Kesehatan',
    selectLanguage: 'Pilih Bahasa',
    welcomeMessage: 'Selamat datang di Pencarian Kesehatan!',
    enterYourName: 'Masukkan nama Anda',
    submit: 'Kirim',
    welcomeUser: 'Selamat datang, {{name}}!',
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
    waterStrategy: 'Berdasarkan berat badan Anda, Anda membutuhkan sekitar {{waterNeed}} liter air per hari. Ini setara dengan sekitar {{glassesNeeded}} gelas air. Cobalah untuk minum sekitar {{hourlyGlasses}} gelas setiap jam Anda terjaga.'
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

export default GamifiedHealthDashboard;