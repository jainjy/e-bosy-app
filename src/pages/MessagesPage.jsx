import React, { useState } from 'react';
import { EnvelopeIcon, UserGroupIcon, BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const MessagesPage = () => {
  const [activeChat, setActiveChat] = useState('John Smith'); // Currently active chat

  const conversations = [
    { name: 'John Smith', role: 'Enseignant', lastMessage: 'Vous: When is the next as...', unread: 0, status: 'online' },
    { name: 'Mike Chen', role: 'Admin', lastMessage: 'Your payment has been...', unread: 1, status: 'online' },
    { name: 'Emily Davis', role: 'Enseignant', lastMessage: 'Looking forward to seein...', unread: 0, status: 'offline' },
  ];

  const chatMessages = [
    { sender: 'John Smith', time: '17:25', text: 'Of course, what would you like to know?' },
    { sender: 'You', time: '17:30', text: 'When is the next assignment due?' },
  ];

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-80 bg-white p-6 shadow-md flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <EnvelopeIcon className="h-6 w-6" />
          <span>Messages Instantanés</span>
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center">
            <span className="text-e-bosy-purple text-2xl font-bold">3</span>
            <span className="text-sm text-gray-600">Conversations</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center">
            <span className="text-e-bosy-purple text-2xl font-bold">0</span>
            <span className="text-sm text-gray-600">Actifs aujourd'hui</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center">
            <span className="text-e-bosy-purple text-2xl font-bold">1</span>
            <span className="text-sm text-gray-600">Non lus</span>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {conversations.map((conv, index) => (
            <div
              key={index}
              onClick={() => setActiveChat(conv.name)}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                activeChat === conv.name ? 'bg-purple-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                  {conv.name.split(' ')[0].charAt(0).toUpperCase()}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white`}></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{conv.name} <span className="text-xs text-gray-500 font-normal ml-1">{conv.role}</span></p>
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{conv.unread}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md m-6">
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
              {activeChat.split(' ')[0].charAt(0).toUpperCase()}
            </div>
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${conversations.find(c => c.name === activeChat)?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} border border-white`}></div>
          </div>
          <div className="ml-3">
            <p className="font-semibold text-gray-800">{activeChat}</p>
            <p className="text-sm text-gray-500">{conversations.find(c => c.name === activeChat)?.role}</p>
          </div>
          <div className="ml-auto flex space-x-3 text-gray-500">
            <button><UserGroupIcon className="h-6 w-6 hover:text-e-bosy-purple" /></button>
            <button><BellIcon className="h-6 w-6 hover:text-e-bosy-purple" /></button>
            <button><ArrowPathIcon className="h-6 w-6 hover:text-e-bosy-purple" /></button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${
                message.sender === 'You' ? 'bg-e-bosy-purple text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 text-right">{message.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Tapez votre message..."
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
          />
          <button className="bg-e-bosy-purple text-white px-6 py-3 rounded-md hover:bg-purple-700">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;