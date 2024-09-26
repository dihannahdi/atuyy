// components/HealthSummary.js

import React from 'react';

const HealthSummary = ({ bmi, bmr, macros, userData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Health Summary</h2>
        <p className="text-lg">Name: {userData.name}</p>
        <p className="text-lg">BMI: {bmi}</p>
        <p className="text-lg">BMR: {bmr} kcal/day</p>
        <p className="text-lg">Protein: {macros.protein}g</p>
        <p className="text-lg">Fat: {macros.fat}g</p>
        <p className="text-lg">Carbs: {macros.carbs}g</p>
      </div>
    </div>
  );
};

export default HealthSummary;