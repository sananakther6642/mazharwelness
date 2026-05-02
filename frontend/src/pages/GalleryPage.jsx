import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { contentAPI } from '../lib/api';
import { Image } from 'lucide-react';

const staticImages = [
  {
    url: 'https://images.pexels.com/photos/13731099/pexels-photo-13731099.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Paediatric therapy session',
    category: 'physiotherapy',
  },
  {
    url: 'https://images.unsplash.com/photo-1617372591382-4ecd2bf8bbc3?auto=format&fit=crop&q=80&w=800',
    caption: 'Yoga and wellness',
    category: 'fitness',
  },
  {
    url: 'https://images.unsplash.com/photo-1570105954248-fa0c1376edfe?auto=format&fit=crop&q=80&w=800',
    caption: 'Our clinic reception',
    category: 'facility',
  },
  {
    url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800',
    caption: 'Group fitness class',
    category: 'fitness',
  },
  {
    url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=800',
    caption: 'Modern gym equipment',
    category: 'facility',
  },
  {
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    caption: 'Stretching exercises',
    category: 'physiotherapy',
  },
  {
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
    caption: 'Personal training session',
    category: 'fitness',
  },
  {
    url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800',
    caption: 'Wellness consultation room',
    category: 'facility',
  },
  {
    url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=800',
    caption: 'Yoga class in progress',
    category: 'fitness',
  },
];

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await contentAPI.getGallery();
        if (response.data.length > 0) {
          setImages(response.data);
        } else {
          setImages(staticImages);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
        setImages(staticImages);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'physiotherapy', label: 'Physiotherapy' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'facility', label: 'Facility' },
  ];

  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 gradient-hero" data-testid="gallery-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
              Gallery
            </Badge>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900 mb-6">
              A Glimpse of <span className="text-[#2A9D8F]">Our Center</span>
            </h1>
            <p className="text-lg text-slate-600">
              Take a virtual tour of our state-of-the-art facilities and see our team in action.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-white" data-testid="gallery-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="bg-slate-100 rounded-full p-1">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.value}
                    value={cat.value}
                    className="rounded-full px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Image Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredImages.map((image, index) => (
                <div 
                  key={index}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                  data-testid={`gallery-image-${index}`}
                >
                  <img 
                    src={image.url}
                    alt={image.caption || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-medium">{image.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredImages.length === 0 && !loading && (
            <div className="text-center py-16">
              <Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GalleryPage;
