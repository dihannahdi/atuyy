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
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Health Quests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Cardio Challenge', 'Nutrition Adventure', 'Mindfulness Journey'].map((quest) => (
                <Card key={quest} className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{quest}</h3>
                    <p className="text-sm mb-4">Complete this quest to level up your health!</p>
                    <Button variant="secondary" size="sm">
                      Start Quest
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedHealthDashboard;