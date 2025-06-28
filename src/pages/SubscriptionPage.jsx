import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, CalendarDaysIcon, CurrencyEuroIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Navbar from '../Components/Navbar';

const SubscriptionPage = () => {
    const { user, logged } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);

    const availablePlans = [
        {
            id: 'monthly_pro',
            name: 'Mensuel Pro',
            price: 5000,
            currency: 'Ariary',
            features: [
                'Accès à tous les cours premium',
                'Sessions en direct illimitées',
                'Support prioritaire',
                'Accès hors ligne au contenu'
            ],
            duration: 'mensuel'
        },
        {
            id: 'yearly_premium',
            name: 'Premium Annuel',
            price: 50000,
            currency: 'Ariary',
            features: [
                'Toutes les fonctionnalités du forfait Mensuel Pro',
                'Accès anticipé exclusif aux nouveaux cours',
                'Parcours d\'apprentissage personnalisé',
                'Vérification de certificat'
            ],
            duration: 'annuel'
        }
    ];

    useEffect(() => {
        if (logged && user) {
            setLoading(true);
            setTimeout(() => {
                if (user.is_subscribed) {
                    setSubscriptionStatus('active');
                    setCurrentPlan({
                        name: 'Premium Annuel',
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
            alert("Veuillez vous connecter pour vous abonner.");
            return;
        }
        setLoading(true);
        try {
            setTimeout(() => {
                alert(`Abonnement à ${planId} initié avec succès ! (Ceci est une simulation)`);
                setSubscriptionStatus('active');
                setCurrentPlan({
                    name: availablePlans.find(p => p.id === planId)?.name || "Nouveau Plan",
                    expiry_date: new Date(Date.now() + (planId.includes('monthly') ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString()
                });
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error("Erreur d'abonnement:", error);
            alert("Une erreur est survenue lors de l'abonnement.");
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!logged) {
            alert("Veuillez vous connecter pour gérer votre abonnement.");
            return;
        }
        if (window.confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?")) {
            setLoading(true);
            try {
                setTimeout(() => {
                    alert("Abonnement annulé ! (Ceci est une simulation)");
                    setSubscriptionStatus('inactive');
                    setCurrentPlan(null);
                    setLoading(false);
                }, 1500);
            } catch (error) {
                console.error("Erreur d'annulation:", error);
                alert("Une erreur est survenue lors de l'annulation.");
                setLoading(false);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!logged) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
                <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Accès refusé</h2>
                <p className="text-lg text-gray-600 mb-6 text-center">Veuillez vous connecter pour voir et gérer votre abonnement.</p>
                <Link to="/login" className="bg-e-bosy-purple text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition duration-300">
                    Se Connecter
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 p-6 sm:p-10 m-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
                    Votre Abonnement
                </h1>

                {subscriptionStatus === 'active' && (
                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-10 border border-green-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-10 w-10 text-green-500 mr-4" />
                                <div>
                                    <h2 className="text-3xl font-bold text-green-600">Abonnement Actif</h2>
                                    <p className="text-gray-600">Vous avez accès à tout le contenu premium !</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
                            <div className="flex items-center">
                                <SparklesIcon className="h-6 w-6 text-e-bosy-purple mr-2" />
                                <strong>Formule actuelle :</strong> {currentPlan?.name || 'Non défini'}
                            </div>
                            <div className="flex items-center">
                                <CalendarDaysIcon className="h-6 w-6 text-e-bosy-purple mr-2" />
                                <strong>Expire le :</strong> {currentPlan?.expiry_date || 'Non défini'}
                            </div>
                        </div>
                        <div className="text-center">
                            <button
                                onClick={handleCancelSubscription}
                                disabled={loading}
                                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Annulation en cours...' : 'Annuler l\'abonnement'}
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
                                    <h2 className="text-3xl font-bold text-yellow-600">Non Abonné</h2>
                                    <p className="text-gray-600">Déverrouillez l'accès à toutes les fonctionnalités premium !</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-700 text-lg text-center">
                            Choisissez un plan ci-dessous pour commencer et élever votre expérience d'apprentissage.
                        </p>
                    </div>
                )}

                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Choisissez Votre Formule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {availablePlans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                                <div className="flex items-baseline text-e-bosy-purple">
                                    <CurrencyEuroIcon className="h-6 w-6" />
                                    <span className="text-4xl font-extrabold">{plan.price}</span>
                                    <span className="text-xl font-medium">/{plan.duration === 'monthly' ? 'mois' : 'an'}</span>
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
                                {subscriptionStatus === 'active' ? 'Formule Actuelle' : (loading ? 'Traitement...' : 'Commencer')}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="mt-10 text-center text-gray-500 text-sm">
                    *Les paiements d'abonnement sont traités de manière sécurisée via Stripe. Vous pouvez annuler à tout moment.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionPage;
