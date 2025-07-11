import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, CalendarDaysIcon, CurrencyDollarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Navbar from '../Components/Navbar';
import { toast } from 'react-toastify';

const SubscriptionPage = () => {
    const { user, logged } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const navigate = useNavigate();

    const availablePlans = [
        {
            id: 'monthly_pro',
            name: 'Mensuel Pro',
            price: 5000,
            currency: 'Ariary',
            features: [
                'Accès à tous les cours premium',
                'Sessions en direct illimitées',
                'Support prioritaire 24/7',
                'Accès hors ligne au contenu',
                'Certificats de réussite',
                'Badges exclusifs'
            ],
            duration: 'mensuel',
            popular: false
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
                'Vérification de certificat',
                'Mentorat personnalisé',
                'Économisez 20% par rapport au plan mensuel'
            ],
            duration: 'annuel',
            popular: true
        }
    ];

    useEffect(() => {
        if (logged && user) {
            setLoading(true);
            setTimeout(() => {
                if (user.isSubscribed) {
                    setSubscriptionStatus('active');
                    setCurrentPlan({
                        name: 'Premium Annuel',
                        expiryDate: user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'
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

    const handleSubscribe = async (plan) => {
        if (!logged) {
            toast.error("Veuillez vous connecter pour vous abonner.");
            navigate('/login', { state: { from: '/subscription' } });
            return;
        }
        navigate('/payment', { 
            state: { 
                plan,
                returnUrl: '/subscription'
            } 
        });
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <div className="pt-24 p-6 sm:p-10 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">
                        Choisissez votre plan
                    </h1>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Débloquez tout le potentiel de votre apprentissage avec nos plans premium
                    </p>
                </motion.div>

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
                                <strong>Expire le :</strong> {currentPlan?.expiryDate || 'Non défini'}
                            </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {availablePlans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            className={`relative bg-white rounded-2xl shadow-xl p-8 border-2 ${
                                plan.popular ? 'border-purple-500' : 'border-gray-200'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                                    Plus populaire
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                                <div className="text-purple-600 font-bold">
                                    <span className="text-3xl">{plan.price.toLocaleString()}</span>
                                    <span className="text-lg"> {plan.currency}</span>
                                    <span className="text-gray-500 text-base">/{plan.duration}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start"
                                    >
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                                        <span className="text-gray-700">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={loading || subscriptionStatus === 'active'}
                                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                                    plan.popular 
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {subscriptionStatus === 'active' 
                                    ? 'Déjà abonné' 
                                    : loading 
                                        ? 'Traitement...' 
                                        : `Choisir ${plan.name}`}
                            </button>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default SubscriptionPage;
