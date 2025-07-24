import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCardIcon, DevicePhoneMobileIcon, BuildingLibraryIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import {  postData } from '../services/ApiFetch';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [selectedMethod, setSelectedMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    });
    const [mobileDetails, setMobileDetails] = useState({
        phoneNumber: '',
        operator: 'orange'
    });

    const planDetails = location.state?.plan || {
        price: 50000,
        name: 'Premium Annuel',
        duration: 'annual'
    };

    const paymentMethods = [
        {
            id: 'card',
            name: 'Carte de crédit',
            icon: CreditCardIcon,
            description: 'Payer avec Visa, Mastercard ou American Express'
        },
        {
            id: 'mobile',
            name: 'Mobile Money',
            icon: DevicePhoneMobileIcon,
            description: 'Orange Money, MVola, ou Airtel Money'
        },
        {
            id: 'bank',
            name: 'Virement bancaire',
            icon: BuildingLibraryIcon,
            description: 'Payer directement depuis votre compte bancaire'
        }
    ];

    useEffect(() => {
        if (!location.state?.plan) {
            if (user.role!="etudiant"){
                navigate('/404');
            }
            toast.error("Aucun plan sélectionné");
            navigate('/subscription');
        }
    }, [location.state, navigate]);

    const handleBack = () => {
        navigate(location.state?.returnUrl || '/subscription');
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const paymentData = {
                userId: user.userId,
                amount: planDetails.price,
                paymentMethod: selectedMethod,
                currency: 'MGA',
                transactionId: Date.now().toString()
            };

            const [response,erreur] = await postData(`Payment/subscription`,paymentData,false);

            if (erreur) throw new Error('Erreur de paiement');
            
            // Vérifier le paiement
            await postData(`Payment/verify/${response.paymentId}`);

            await refreshUser();

            toast.success('Paiement effectué avec succès! Votre abonnement est maintenant actif.');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Erreur lors du paiement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto pt-24 p-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Retour
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-8"
                >
                    <h1 className="text-2xl font-bold mb-6">Paiement de l'abonnement</h1>
                    
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-lg font-medium">{planDetails.name}</p>
                            <p className="text-2xl font-bold">{planDetails.price.toLocaleString()} MGA</p>
                            <p className="text-gray-600">Durée: {planDetails.duration === 'annual' ? '12 mois' : '1 mois'}</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Choisissez votre méthode de paiement</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                className={`p-4 border rounded-lg text-left ${
                                    selectedMethod === method.id 
                                        ? 'border-purple-500 bg-purple-50' 
                                        : 'border-gray-200 hover:border-purple-500'
                                }`}
                                onClick={() => setSelectedMethod(method.id)}
                            >
                                <method.icon className="h-6 w-6 mb-2 text-purple-600" />
                                <h3 className="font-semibold">{method.name}</h3>
                                <p className="text-sm text-gray-600">{method.description}</p>
                            </button>
                        ))}
                    </div>

                    {selectedMethod && (
                        <form onSubmit={handlePayment} className="space-y-4">
                            {selectedMethod === 'card' && (
                                <>
                                    <div>
                                        <label className="block mb-1">Numéro de carte</label>
                                        <input
                                            type="text"
                                            value={cardDetails.number}
                                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            placeholder="1234 5678 9012 3456"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1">Date d'expiration</label>
                                            <input
                                                type="text"
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                                className="w-full p-2 border rounded"
                                                placeholder="MM/YY"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1">CVC</label>
                                            <input
                                                type="text"
                                                value={cardDetails.cvc}
                                                onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                                                className="w-full p-2 border rounded"
                                                placeholder="123"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedMethod === 'mobile' && (
                                <>
                                    <div>
                                        <label className="block mb-1">Opérateur</label>
                                        <select
                                            value={mobileDetails.operator}
                                            onChange={(e) => setMobileDetails({...mobileDetails, operator: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            required
                                        >
                                            <option value="orange">Orange Money</option>
                                            <option value="airtel">Airtel Money</option>
                                            <option value="mvola">MVola</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-1">Numéro de téléphone</label>
                                        <input
                                            type="tel"
                                            value={mobileDetails.phoneNumber}
                                            onChange={(e) => setMobileDetails({...mobileDetails, phoneNumber: e.target.value})}
                                            className="w-full p-2 border rounded"
                                            placeholder="034 XX XXX XX"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {selectedMethod === 'bank' && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium">Coordonnées bancaires:</p>
                                    <p>IBAN: MG46 0000 1234 5678 9012 3456 789</p>
                                    <p>BIC: BMOIMGMG</p>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Veuillez effectuer le virement avec le montant exact et utiliser votre email comme référence.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-300"
                            >
                                {loading ? 'Traitement...' : `Payer ${planDetails.price.toLocaleString()} MGA`}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentPage;
