import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, CalendarDaysIcon, CurrencyEuroIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { Link } from 'react-router-dom';
const SubscriptionPage = () => {
    const { user, logged } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);

    // Dummy subscription plans (you'd fetch these from your backend)
    const availablePlans = [
        {
            id: 'monthly_pro',
            name: 'Pro Monthly',
            price: 5000,
            currency: 'Ariary',
            features: [
                'Access to all premium courses',
                'Unlimited live sessions',
                'Priority support',
                'Offline content access'
            ],
            duration: 'monthly'
        },
        {
            id: 'yearly_premium',
            name: 'Premium Yearly',
            price: 50000,
            currency: 'Ariary',
            features: [
                'All Pro Monthly features',
                'Exclusive early access to new courses',
                'Personalized learning path',
                'Certificate verification'
            ],
            duration: 'yearly'
        }
    ];

    useEffect(() => {
        if (logged && user) {
            // Simulate fetching subscription status
            setLoading(true);
            setTimeout(() => {
                if (user.is_subscribed) {
                    setSubscriptionStatus('active');
                    // In a real app, you'd fetch the actual plan details based on user's subscription
                    setCurrentPlan({
                        name: 'Premium Yearly', // Example: assume user is on Premium Yearly
                        expiry_date: user.subscription_expiry ? new Date(user.subscription_expiry).toLocaleDateString() : 'N/A'
                    });
                } else {
                    setSubscriptionStatus('inactive');
                }
                setLoading(false);
            }, 500);
        } else {
            setLoading(false);
            setSubscriptionStatus('not_logged_in');
        }
    }, [user, logged]);

    const handleSubscribe = async (planId) => {
        if (!logged) {
            alert("Please log in to subscribe.");
            return;
        }
        setLoading(true);
        try {
            // Simulate API call for subscription
            console.log(`Subscribing to plan: ${planId}`);
            // In a real application:
            // const response = await subscribeUser(user.user_id, planId);
            // if (response.success) {
            //     alert("Subscription successful!");
            //     // Update user context and re-fetch status
            // } else {
            //     alert("Subscription failed: " + response.message);
            // }
            setTimeout(() => {
                alert(`Successfully initiated subscription for ${planId}! (This is a simulation)`);
                // In a real app, you'd trigger a re-fetch of user data or update context
                // For demonstration, we'll just set it to active
                setSubscriptionStatus('active');
                setCurrentPlan({
                    name: availablePlans.find(p => p.id === planId)?.name || "New Plan",
                    expiry_date: new Date(Date.now() + (planId.includes('monthly') ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString() // Dummy expiry
                });
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error("Subscription error:", error);
            alert("An error occurred during subscription.");
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!logged) {
            alert("Please log in to manage your subscription.");
            return;
        }
        if (window.confirm("Are you sure you want to cancel your subscription?")) {
            setLoading(true);
            try {
                // Simulate API call for cancellation
                console.log("Cancelling subscription...");
                // In a real application:
                // const response = await cancelSubscription(user.user_id);
                // if (response.success) {
                //     alert("Subscription cancelled successfully!");
                //     // Update user context and re-fetch status
                // } else {
                //     alert("Cancellation failed: " + response.message);
                // }
                setTimeout(() => {
                    alert("Subscription cancelled! (This is a simulation)");
                    setSubscriptionStatus('inactive');
                    setCurrentPlan(null);
                    setLoading(false);
                }, 1500);
            } catch (error) {
                console.error("Cancellation error:", error);
                alert("An error occurred during cancellation.");
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-lg text-gray-700">Loading subscription status...</p>
            </div>
        );
    }

    if (!logged) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
                <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h2>
                <p className="text-lg text-gray-600 mb-6 text-center">Please log in to view and manage your subscription.</p>
                <Link to="/login" className="bg-e-bosy-purple text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition duration-300">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
                Your Subscription
            </h1>

            {subscriptionStatus === 'active' && (
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-10 border border-green-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-10 w-10 text-green-500 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-green-600">Active Subscriber</h2>
                                <p className="text-gray-600">You're all set to enjoy premium content!</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
                        <div className="flex items-center">
                            <SparklesIcon className="h-6 w-6 text-e-bosy-purple mr-2" />
                            <strong>Current Plan:</strong> {currentPlan?.name || 'N/A'}
                        </div>
                        <div className="flex items-center">
                            <CalendarDaysIcon className="h-6 w-6 text-e-bosy-purple mr-2" />
                            <strong>Expires On:</strong> {currentPlan?.expiry_date || 'N/A'}
                        </div>
                    </div>
                    <div className="text-center">
                        <button
                            onClick={handleCancelSubscription}
                            disabled={loading}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Cancelling...' : 'Cancel Subscription'}
                        </button>
                    </div>
                </div>
            )}

            {subscriptionStatus === 'inactive' && (
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-10 border border-yellow-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <XCircleIcon className="h-10 w-10 text-yellow-500 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-yellow-600">Not Subscribed</h2>
                                <p className="text-gray-600">Unlock full access to all premium features!</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-700 text-lg text-center">
                        Choose a plan below to get started and elevate your learning experience.
                    </p>
                </div>
            )}

            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Choose Your Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {availablePlans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                            <div className="flex items-baseline text-e-bosy-purple">
                                <CurrencyEuroIcon className="h-6 w-6" />
                                <span className="text-4xl font-extrabold">{plan.price}</span>
                                <span className="text-xl font-medium">/{plan.duration === 'monthly' ? 'mo' : 'yr'}</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-6 text-gray-700">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={loading || subscriptionStatus === 'active'}
                            className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition duration-300 ${
                                subscriptionStatus === 'active'
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-e-bosy-purple hover:bg-purple-700'
                            }`}
                        >
                            {subscriptionStatus === 'active' ? 'Current Plan' : (loading ? 'Processing...' : 'Get Started')}
                        </button>
                    </div>
                ))}
            </div>

            <p className="mt-10 text-center text-gray-500 text-sm">
                *Subscription payments are processed securely via Stripe. You can cancel anytime.
            </p>
        </div>
    );
};

export default SubscriptionPage;