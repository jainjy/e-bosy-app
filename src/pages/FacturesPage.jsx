import React, { useState, useEffect } from 'react';
import {  ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import {  getData } from '../services/ApiFetch';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import generateInvoicePDF from '../utils/generateInvoicePDF';

const FacturesPage = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const [response,erreur] = await getData(
                `Payment/user/${user.userId}`
            );
            
            if (erreur) {
                throw new Error('Erreur lors du chargement des factures'+erreur);
            }
            setPayments(response);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des factures');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (payment) => {
        try {
            console.log('Téléchargement de la facture pour le paiement:', payment);
            const doc = generateInvoicePDF(payment);
            doc.save(`facture_${payment.paymentId}.pdf`);
        } catch (error) {
            console.error('Erreur de téléchargement:', error);
            toast.error('Erreur lors du téléchargement de la facture');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Factures</h1>

                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        N° Facture
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Montant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        État
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{payment.paymentId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(payment.paymentDate), 'dd MMMM yyyy', { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.amount.toLocaleString()} {payment.currency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                payment.status === 'complete' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {payment.statusDisplayName || payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.status === 'complete' && (
                                                <button
                                                    onClick={() => handleDownload(payment)}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                                >
                                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                                    Télécharger
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            Aucune facture disponible
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacturesPage;