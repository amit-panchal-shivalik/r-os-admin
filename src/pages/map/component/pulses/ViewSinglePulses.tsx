import { IconArrowLeftToArc } from '@tabler/icons-react';
import React from 'react';

type Pulse = {
  id: number;
  title: string;
  author: string;
  location: string;
  image: string;
  likes: number;
  comments: number;
  category: string;
  description: string;
};

type Props = {
  pulse: Pulse; // The pulse object to display
    setSelectedPulses: (pulse: Pulse | null) => void; // Function to update selected pulse
};

const ViewSinglePulse = ({ pulse, setSelectedPulses }: Props) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
    <div>
        <IconArrowLeftToArc onClick={()=>setSelectedPulses(null)}/>
      </div>
      {/* Image */}
      {pulse.image && (
        <img
          src={pulse.image}
          alt={pulse.title}
          className="w-full h-64 object-cover rounded-lg shadow-md"
        />
      )}

      {/* Title and Author */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900">{pulse.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          By <span className="font-medium text-gray-600">{pulse.author}</span>
        </p>
      </div>

      {/* Location and Category */}
      <div className="mt-4 flex items-center gap-4">
        <span className="text-sm text-gray-500">
          <strong>Location:</strong> {pulse.location}
        </span>
        <span className="text-sm text-gray-500">
          <strong>Category:</strong> {pulse.category}
        </span>
      </div>

      {/* Description */}
      <div className="mt-6">
        <p className="text-gray-700 leading-relaxed">{pulse.description}</p>
      </div>

      {/* Likes and Comments */}
      {/* <div className="mt-6 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold">{pulse.likes}</span>
          <span className="text-sm text-gray-500">Likes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-bold">{pulse.comments}</span>
          <span className="text-sm text-gray-500">Comments</span>
        </div>
      </div> */}
    </div>
  );
};

export default ViewSinglePulse;