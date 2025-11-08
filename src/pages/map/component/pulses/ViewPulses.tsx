import React from 'react'

type Props = {}

const ViewPulses = (props: Props) => {

     const mockPulses = [
    {
      id: 1,
      title: 'Street Food Fest',
      author: 'Ahmedabad Buzz',
      location: 'Manek Chowk',
      image: 'https://source.unsplash.com/random/400x300?street-food',
      likes: 324,
      comments: 21,
    },
    {
      id: 2,
      title: 'Local Art Exhibition',
      author: 'Kalakar Society',
      location: 'CG Road',
      likes: 150,
      comments: 8,
    },
    {
      id: 3,
      title: 'Night Cycling Ride',
      author: 'City Riders',
      location: 'Riverfront',
      image: 'https://source.unsplash.com/random/400x300?cycling',
      likes: 89,
      comments: 5,
    },
    {
      id: 3,
      title: 'Night Cycling Ride',
      author: 'City Riders',
      location: 'Riverfront',
      image: 'https://source.unsplash.com/random/400x300?cycling',
      likes: 89,
      comments: 5,
    },
    {
      id: 3,
      title: 'Night Cycling Ride',
      author: 'City Riders',
      location: 'Riverfront',
      image: 'https://source.unsplash.com/random/400x300?cycling',
      likes: 89,
      comments: 5,
    },
  ];
  return (
     <div className=" px-6 pb-6 space-y-5">
            {mockPulses.map((pulse) => (
              <div
                key={pulse.id}
                className=" shadow-md rounded-2xl  hover:shadow-xl transition-shadow duration-300"
              >
                {pulse.image && (
                  <img src={pulse.image} alt={pulse.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{pulse.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">By <span className="font-medium text-gray-600">{pulse.author}</span></p>
                  {/* <div className="flex items-center justify-end gap-4 mt-4">
                    <button className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors">
                      <Heart size={18} className="text-red-500/80" /> 
                      <span className="text-sm font-medium">{pulse.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 transition-colors">
                      <MessageCircle size={18} className="text-blue-500/80" /> 
                      <span className="text-sm font-medium">{pulse.comments}</span>
                    </button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
  )
}

export default ViewPulses