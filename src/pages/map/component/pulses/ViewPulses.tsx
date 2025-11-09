import React from 'react'
import ViewSinglePulse from './ViewSinglePulses';

type Props = {}

const ViewPulses = (props: Props) => {
  const [selectedPulses, setSelectedPulses] = React.useState(null);
const mockPulses = [
  {
    id: 1,
    title: "Ahmedabad Street Food Festival 2025",
    author: "Ahmedabad Buzz",
    location: "Manek Chowk",
    image: "https://images.unsplash.com/photo-1565958011705-44e2118b5c1b",
    likes: 324,
    comments: 21,
    category: "Food & Culture",
    description:
      "The annual Ahmedabad Street Food Fest brought together hundreds of food lovers for a night of authentic Gujarati snacks, fusion delicacies, and music at Manek Chowk.",
  },
  {
    id: 2,
    title: "Local Art Exhibition: Colors of Gujarat",
    author: "Kalakar Society",
    location: "CG Road Art Gallery",
    image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92",
    likes: 150,
    comments: 8,
    category: "Art & Exhibitions",
    description:
      "A stunning exhibition showcasing local artists’ work, from traditional Pichwai paintings to modern art installations that capture Gujarat’s vibrant heritage.",
  },
  {
    id: 3,
    title: "Night Cycling Ride along the Riverfront",
    author: "City Riders Club",
    location: "Sabarmati Riverfront",
    image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf",
    likes: 89,
    comments: 5,
    category: "Sports & Outdoor",
    description:
      "Over 200 cyclists joined the midnight ride exploring the illuminated riverfront, promoting fitness and sustainable city commuting.",
  },
  {
    id: 4,
    title: "Sunday Farmers’ Market Launches at Thaltej",
    author: "GreenLife Ahmedabad",
    location: "Thaltej Community Ground",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    likes: 245,
    comments: 14,
    category: "Community",
    description:
      "Local farmers, artisans, and home bakers came together for the city’s first zero-waste farmers’ market offering organic produce and handmade goods.",
  },
  {
    id: 5,
    title: "Startup Mixer: Innovate Ahmedabad",
    author: "TechHub India",
    location: "IIM Ahmedabad Auditorium",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
    likes: 310,
    comments: 33,
    category: "Business & Innovation",
    description:
      "A vibrant networking event connecting startups, investors, and tech enthusiasts to discuss AI-driven solutions and emerging business opportunities.",
  },
  {
    id: 6,
    title: "Yoga at Sunrise – Wellness for All",
    author: "Namaste Ahmedabad",
    location: "Kankaria Lake",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3",
    likes: 412,
    comments: 27,
    category: "Health & Wellness",
    description:
      "Hundreds gathered at sunrise to participate in the International Yoga Day celebration, emphasizing the importance of holistic living and mindfulness.",
  },
  {
    id: 7,
    title: "Garba Nights Return with Full Energy",
    author: "Cultural Vibes",
    location: "GMDC Grounds",
    image: "https://images.unsplash.com/photo-1575224526797-5730d3a4b6b1",
    likes: 502,
    comments: 41,
    category: "Festivals",
    description:
      "After a two-year pause, Navratri celebrations are back with vibrant costumes, traditional music, and electrifying Garba nights across Ahmedabad.",
  },
  {
    id: 8,
    title: "Clean Drive: Volunteers Revive the Riverfront",
    author: "Ahmedabad Green Team",
    location: "Sabarmati Riverfront",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
    likes: 128,
    comments: 9,
    category: "Environment",
    description:
      "A volunteer-driven cleanup initiative collected over 3 tons of plastic waste, aiming to restore the beauty and health of the Sabarmati River.",
  },
  {
    id: 9,
    title: "Ahmedabad’s New Co-Working Hub Opens in Bodakdev",
    author: "UrbanSpace India",
    location: "Bodakdev",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
    likes: 276,
    comments: 18,
    category: "Business & Lifestyle",
    description:
      "UrbanSpace Coworking launched its latest hub with smart offices, nap pods, and a rooftop café — a new hotspot for freelancers and startups.",
  },
  {
    id: 10,
    title: "Weekend Flea Market Brings Indie Brands Together",
    author: "City Flea Crew",
    location: "Law Garden",
    image: "https://images.unsplash.com/photo-1556742031-c6961e8560b0",
    likes: 195,
    comments: 12,
    category: "Shopping & Lifestyle",
    description:
      "Indie brands showcased handmade crafts, jewelry, and fashion at the vibrant Law Garden Flea — complete with live music and food stalls.",
  },
  {
    id: 11,
    title: "AI in Education – Panel Discussion at Nirma University",
    author: "EduConnect",
    location: "Nirma University",
    image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e",
    likes: 234,
    comments: 15,
    category: "Technology & Education",
    description:
      "Experts from across India discussed how artificial intelligence is transforming learning experiences and future classroom models.",
  },
  {
    id: 12,
    title: "Heritage Walk: Stories of Old Ahmedabad",
    author: "Heritage Foundation",
    location: "Pols of Old City",
    image: "https://images.unsplash.com/photo-1560184897-47b6ce5f0a32",
    likes: 178,
    comments: 10,
    category: "Culture & Travel",
    description:
      "A guided heritage walk took participants through centuries-old havelis and temples, sharing tales of Ahmedabad’s glorious past.",
  },
];



  return (
    <div className="px-6 pb-6 space-y-5">
      {selectedPulses ? (
        // Render the single pulse view if a pulse is selected
        <ViewSinglePulse pulse={selectedPulses} setSelectedPulses={setSelectedPulses} />
      ) : (
        // Render the list of pulses
        mockPulses.map((pulse) => (
          <div
            key={pulse.id}
            onClick={() => setSelectedPulses(pulse)} // Set the selected pulse on click
            className="shadow-md rounded-2xl hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            {pulse.image && (
              <img
                src={pulse.image}
                alt={pulse.title}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {pulse.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                By{' '}
                <span className="font-medium text-gray-600">{pulse.author}</span>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ViewPulses