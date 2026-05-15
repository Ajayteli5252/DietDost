import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/userApi';

import Step1BasicInfo from '../components/onboarding/Step1BasicInfo';
import Step2Goal from '../components/onboarding/Step2Goal';
import Step3ActivityLevel from '../components/onboarding/Step3ActivityLevel';
import Step4DietType from '../components/onboarding/Step4DietType';
import Step5WorkoutType from '../components/onboarding/Step5WorkoutType';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const { completeOnboarding } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        goal: '',
        activity_level: '',
        diet_type: '',
        workout_type: '',
    });

    useEffect(() => {
        const fetchExistingProfile = async () => {
            try {
                const res = await userApi.getProfile();
                if (res.success && res.profile) {
                    const p = res.profile;
                    setFormData({
                        height: p.height || '',
                        weight: p.weight || '',
                        goal: p.goal || '',
                        activity_level: p.activity_level || '',
                        diet_type: p.diet_type || '',
                        workout_type: p.workout_type || '',
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };

        fetchExistingProfile();
    }, []);

    const totalSteps = 5;

    const updateFormData = (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
        setError('');
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await userApi.saveOnboarding(formData);

            if (res.success) {
                completeOnboarding();
                navigate('/dashboard');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again!');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        'Basic Info',
        'Goal',
        'Activity',
        'Diet Type',
        'Workout',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-4xl">🥗</span>
                    <h1 className="text-2xl font-bold text-green-600 mt-2">DietDost Setup</h1>
                    <p className="text-gray-500 text-sm mt-1">Set up your profile for a personalized experience!</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        {steps.map((step, index) => (
                            <div
                                key={step}
                                className={`text-xs font-medium ${index + 1 <= currentStep ? 'text-green-600' : 'text-gray-400'
                                    }`}
                            >
                                {index + 1 <= currentStep ? '✓' : index + 1}
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-2 bg-green-600 rounded-full transition-all duration-500"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                        {steps.map((step, index) => (
                            <span
                                key={step}
                                className={`text-xs ${index + 1 <= currentStep ? 'text-green-600 font-medium' : 'text-gray-400'
                                    }`}
                            >
                                {step}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Steps */}
                    {currentStep === 1 && (
                        <Step1BasicInfo
                            data={formData}
                            onUpdate={updateFormData}
                            onNext={nextStep}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2Goal
                            data={formData}
                            onUpdate={updateFormData}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3ActivityLevel
                            data={formData}
                            onUpdate={updateFormData}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 4 && (
                        <Step4DietType
                            data={formData}
                            onUpdate={updateFormData}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 5 && (
                        <Step5WorkoutType
                            data={formData}
                            onUpdate={updateFormData}
                            onBack={prevStep}
                            onSubmit={handleSubmit}
                            loading={loading}
                        />
                    )}
                </div>

                {/* Step Counter */}
                <p className="text-center text-gray-400 text-sm mt-4">
                    Step {currentStep} of {totalSteps}
                </p>
            </div>
        </div>
    );
};

export default OnboardingPage;