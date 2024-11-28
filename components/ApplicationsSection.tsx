import { useState } from 'react';
import { AddApplicationModal, AddApplicationButton } from './AddApplicationModal';

export const ApplicationsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplicationAdded = async () => {
    // Refresh your applications list here
  };

  return (
    <div className="relative">
      {/* Position the button in the top right */}
      <div className="absolute top-4 right-4">
        <AddApplicationButton onClick={() => setIsModalOpen(true)} />
      </div>

      {/* Modal */}
      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplicationAdded={handleApplicationAdded}
      />

      {/* Rest of your applications section content */}
    </div>
  );
}; 