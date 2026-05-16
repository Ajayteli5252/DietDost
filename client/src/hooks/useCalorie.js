import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const useCalorie = () => {
    const [todayMeals, setTodayMeals] = useState([]);
    const [totals, setTotals] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
    });
    const [targets, setTargets] = useState(null);
    const [loading, setLoading] = useState(false);

    // Aaj ka data fetch karo
    const fetchTodayMeals = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/meal/today');
            if (res.data.success) {
                setTodayMeals(res.data.meals);
                setTotals(res.data.totals);
                setTargets(res.data.targets);
            }
        } catch (error) {
            console.error('FetchTodayMeals error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Meal add karo
    const addMeal = async (mealData) => {
        try {
            const res = await apiClient.post('/meal/add', mealData);
            if (res.data.success) {
                await fetchTodayMeals(); // Refresh karo
            }
            return res.data;
        } catch (error) {
            console.error('AddMeal error:', error);
            throw error;
        }
    };

    // Meal delete karo
    const deleteMeal = async (id) => {
        try {
            await apiClient.delete('/meal/' + id);
            await fetchTodayMeals(); // Refresh karo
        } catch (error) {
            console.error('DeleteMeal error:', error);
            throw error;
        }
    };

    // Water log karo
    const logWater = async (glasses) => {
        try {
            const res = await apiClient.post('/meal/water', { glasses });
            return res.data;
        } catch (error) {
            console.error('LogWater error:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchTodayMeals();
    }, []);

    return {
        todayMeals,
        totals,
        targets,
        loading,
        fetchTodayMeals,
        addMeal,
        deleteMeal,
        logWater,
    };
};