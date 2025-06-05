import React, { useState } from 'react';
import { PlayCircleIcon, ChatBubbleOvalLeftEllipsisIcon, DocumentTextIcon, QuestionMarkCircleIcon, ClipboardDocumentListIcon, AcademicCapIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const LessonPage = () => {
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson', 'quiz', 'exercise', 'exam'

  const courseProgression = [
    { title: 'Course Introduction', duration: '10 min', completed: true },
    { title: 'Introduction to React Hooks', duration: '15 min', completed: false },
    { title: 'Using the useState Hook', duration: '20 min', completed: false },
    // ... more lessons
  ];

  const comments = [
    { author: 'John Doe', time: '1 day ago', text: 'Great explanation of hooks!' },
    { author: 'Alice Smith', time: 'about 12 hours ago', text: 'I agree, very clear and concise.' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white p-6 shadow-md flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Progression du cours</h3>
        <p className="text-gray-600 mb-4">1 sur 3 terminées</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-e-bosy-purple h-2 rounded-full" style={{ width: '33%' }}></div>
        </div>
        <nav className="space-y-3 flex-1">
          {courseProgression.map((item, index) => (
            <div key={index} className={`flex items-center space-x-3 p-2 rounded-md ${item.completed ? 'text-green-600' : 'text-gray-700'}`}>
              {item.completed && <PlayCircleIcon className="h-5 w-5 text-green-500" />}
              {!item.completed && <div className="w-5 h-5 rounded-full border border-gray-400"></div>}
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">{item.duration}</p>
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto flex justify-between pt-4 border-t border-gray-200">
          <button className="flex items-center space-x-2 text-e-bosy-purple hover:underline">
            <ChevronLeftIcon className="h-5 w-5" />
            <span>Précédent</span>
          </button>
          <button className="bg-e-bosy-purple text-white px-6 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700">
            <span>Suivant</span>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Introduction to React Hooks</h2>
          <button className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700">
            Leçon suivante <ChevronRightIcon className="h-4 w-4 inline-block ml-2" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'lesson' ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' : 'text-gray-600 hover:text-e-bosy-purple'}`}
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Leçon</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'quiz' ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' : 'text-gray-600 hover:text-e-bosy-purple'}`}
            >
              <QuestionMarkCircleIcon className="h-5 w-5" />
              <span>Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'exercise' ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' : 'text-gray-600 hover:text-e-bosy-purple'}`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span>Exercice</span>
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'exam' ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' : 'text-gray-600 hover:text-e-bosy-purple'}`}
            >
              <AcademicCapIcon className="h-5 w-5" />
              <span>Examen</span>
            </button>
          </div>

          {activeTab === 'lesson' && (
            <div>
              {/* This is the video player section */}
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-6">
                <img
                  src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" // Placeholder for Rick Astley video thumbnail
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover"
                />
                <button className="absolute inset-0 flex items-center justify-center">
                  <PlayCircleIcon className="h-20 w-20 text-white opacity-90 hover:opacity-100 transition-opacity duration-200" />
                </button>
              </div>
              <p className="text-gray-700">
                {/* Your lesson content here */}
                This section would contain the detailed content of the lesson, which could be text, images, code snippets, etc.
                For demonstration purposes, we are showing a placeholder video for "Rick Astley - Never Gonna Give You Up".
                The actual content will be dynamically loaded based on the `Lesson.content` and `Lesson.content_type` fields.
              </p>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="py-4">
              <h3 className="text-xl font-bold mb-4">Quiz for this lesson</h3>
              <p className="text-gray-600">Quiz content goes here...</p>
              {/* You would build quiz components here */}
            </div>
          )}

          {activeTab === 'exercise' && (
            <div className="py-4">
              <h3 className="text-xl font-bold mb-4">Exercise for this lesson</h3>
              <p className="text-gray-600">Exercise instructions and submission form...</p>
              {/* You would build exercise components here */}
            </div>
          )}

          {activeTab === 'exam' && (
            <div className="py-4">
              <h3 className="text-xl font-bold mb-4">Exam for this lesson</h3>
              <p className="text-gray-600">Exam instructions and timer...</p>
              {/* You would build exam components here */}
            </div>
          )}
        </div>

        {/* Discussion Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
            <span>Discussion ({comments.length})</span>
          </h3>
          <div className="mb-6">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              rows="4"
              placeholder="Add a comment..."
            ></textarea>
            <div className="flex justify-end mt-3">
              <button className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700">
                Post Comment
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {comments.map((comment, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{comment.author}</p>
                    <p className="text-xs text-gray-500">{comment.time}</p>
                  </div>
                </div>
                <p className="text-gray-700 ml-11">{comment.text}</p>
                <div className="flex space-x-4 mt-3 ml-11 text-sm text-gray-500">
                  <button className="hover:text-e-bosy-purple">Reply</button>
                  <button className="hover:text-e-bosy-purple">Like</button>
                  <button className="hover:text-e-bosy-purple">Report</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;