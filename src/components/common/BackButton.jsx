import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button
      onClick={handleGoBack}
      className={`flex items-center text-gray-600 hover:text-e-bosy-purple transition-colors ${className}`}
    >
      <ArrowLeftIcon className="h-5 w-5 mr-2" />
      <span>Retour</span>
    </button>
  );
};

export default BackButton;
