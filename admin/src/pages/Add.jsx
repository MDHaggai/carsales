import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaVideo, FaCar } from 'react-icons/fa';

const Add = ({ token }) => {
  // Form states
  const [formData, setFormData] = useState({
    name: '',  // Add this line
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    description: '',
    price: '',
    downPayment: '',
    monthlyPayment: '',
    mileage: '',
    condition: 'New',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    features: [],
    bestseller: false
  });

  // File states
  const [showAllImages, setShowAllImages] = useState(false);
  const [images, setImages] = useState(Array(8).fill(null)); // Increase to 8 images
  const [videos, setVideos] = useState(Array(2).fill(null));
  const [uploading, setUploading] = useState(false);

  // Replace static carBrands with dynamic brands from database
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch brands when component mounts
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/brand/list`);
      if (response.data.success) {
        setBrands(response.data.brands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  // Common features
  const commonFeatures = [
    'Leather Seats', 'Sunroof', 'Navigation System',
    'Bluetooth', 'Backup Camera', 'Parking Sensors',
    'Heated Seats', 'Third Row Seating', 'Apple CarPlay',
    'Android Auto', 'Blind Spot Monitor', 'Lane Departure Warning'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  const handleVideoChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newVideos = [...videos];
      newVideos[index] = file;
      setVideos(newVideos);
    }
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      
      // Log form data for debugging
      console.log('Submitting form data:', formData);
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append images and videos
      images.forEach((image, index) => {
        if (image) {
          console.log(`Appending image ${index + 1}:`, image);
          formDataToSend.append(`image${index + 1}`, image);
        }
      });

      videos.forEach((video, index) => {
        if (video) {
          console.log(`Appending video ${index + 1}:`, video);
          formDataToSend.append(`video${index + 1}`, video);
        }
      });

      console.log('Making request to:', `${backendUrl}/api/product/add`);
      
      const token = localStorage.getItem('token');
      console.log('Using token:', token);

      const response = await axios({
        method: 'POST',
        url: `${backendUrl}/api/product/add`,
        headers: {
          'token': token,
          'Accept': 'application/json',
        },
        data: formDataToSend,
        withCredentials: true,
        timeout: 120000, // Increased to 2 minutes for large files
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        validateStatus: (status) => status >= 200 && status < 500,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        }
      });

      console.log('Response:', response);

      if (response.data.success) {
        toast.success('Vehicle listed successfully!');
        // Reset form
        setFormData({
          name: '',
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          description: '',
          price: '',
          downPayment: '',
          monthlyPayment: '',
          mileage: '',
          condition: 'New',
          transmission: 'Automatic',
          fuelType: 'Petrol',
          features: [],
          bestseller: false
        });
        setImages(Array(4).fill(null));
        setVideos(Array(2).fill(null));
      } else {
        throw new Error(response.data.message || 'Failed to list vehicle');
      }
    } catch (error) {
      console.error('Error Details:', {
        message: error.message,
        stack: error.stack,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      toast.error(error.response?.data?.message || 'Error listing vehicle');
    } finally {
      setUploading(false);
    }
  };

  const [vehicleData, setVehicleData] = useState(null);
  const [nhtsvData, setNhtsvData] = useState(null);
  const [loadingVehicleData, setLoadingVehicleData] = useState(false);
  const [apiErrors, setApiErrors] = useState([]);

  // Function to fetch vehicle data when name and year are entered
  useEffect(() => {
    if (formData.brand && formData.model && formData.year) {
      fetchAllVehicleData();
    }
  }, [formData.brand, formData.model, formData.year]);

  const fetchAllVehicleData = async () => {
    setLoadingVehicleData(true);
    setApiErrors([]);
    
    try {
      // Start both API requests in parallel for faster results
      await Promise.all([
        fetchCarQueryData(),
        fetchNHTSAData()
      ]);
    } catch (error) {
      console.error("Error in vehicle data fetch operations:", error);
      setApiErrors(prev => [...prev, "Failed to fetch vehicle data"]);
    } finally {
      setLoadingVehicleData(false);
    }
  };

  const fetchCarQueryData = async () => {
    try {
      const year = formData.year;
      const make = formData.brand.toLowerCase();
      const model = formData.model.toLowerCase();
      
      console.log(`Fetching CarQuery data for: ${year} ${make} ${model}`);
      
      const response = await axios.get(
        `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getTrims&make=${make}&model=${model}&year=${year}`
      );
      
      // CarQuery returns JSONP, we need to extract the JSON part
      const jsonText = response.data.substring(2, response.data.length - 2);
      const data = JSON.parse(jsonText);
      
      if (data && data.Trims && data.Trims.length > 0) {
        console.log("CarQuery data success:", data.Trims[0]);
        setVehicleData(data.Trims[0]); // Use the first trim
      } else {
        console.log("CarQuery returned no results");
        setApiErrors(prev => [...prev, "No CarQuery data found for this vehicle"]);
      }
    } catch (error) {
      console.error("CarQuery API error:", error);
      setApiErrors(prev => [...prev, "CarQuery API error"]);
    }
  };

  const fetchNHTSAData = async () => {
    try {
      const year = formData.year;
      const make = encodeURIComponent(formData.brand);
      const model = encodeURIComponent(formData.model);
      
      console.log(`Fetching NHTSA data for: ${year} ${make} ${model}`);
      
      // First get model details
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}/model/${model}?format=json`
      );
      
      if (response.data.Results && response.data.Results.length > 0) {
        console.log("NHTSA data success:", response.data.Results[0]);
        setNhtsvData(response.data.Results[0]);
        
        // Get more details if possible
        try {
          const modelId = response.data.Results[0].Model_ID;
          const detailsResponse = await axios.get(
            `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForModelID/${modelId}?format=json`
          );
          
          if (detailsResponse.data.Results && detailsResponse.data.Results.length > 0) {
            setNhtsvData(prev => ({
              ...prev,
              vehicleType: detailsResponse.data.Results[0].VehicleTypeName
            }));
          }
        } catch (detailError) {
          console.warn("Could not fetch additional NHTSA details", detailError);
        }
      } else {
        console.log("NHTSA returned no results");
        setApiErrors(prev => [...prev, "No NHTSA data found for this vehicle"]);
      }
    } catch (error) {
      console.error("NHTSA API error:", error);
      setApiErrors(prev => [...prev, "NHTSA API error"]);
    }
  };

  // Enhanced description generator with 24 unique templates (added 10 more)
const generateDescriptionSuggestions = () => {
  if (!formData.brand || !formData.model || !formData.year) return [];
  
  const brand = formData.brand;
  const model = formData.model;
  const name = formData.name || `${brand} ${model}`;
  const year = formData.year;
  const condition = formData.condition;
  const fuelType = formData.fuelType;
  const transmission = formData.transmission;
  const mileage = formData.mileage ? parseInt(formData.mileage).toLocaleString() : "";
  
  // Merge data from both APIs for best results
  const engineData = {
    displacement: vehicleData?.model_engine_cc ? 
      (vehicleData.model_engine_cc / 1000).toFixed(1) + "L" : 
      "efficient",
    horsepower: vehicleData?.model_engine_power_ps ? 
      vehicleData.model_engine_power_ps + " hp" : 
      "powerful",
    cylinders: vehicleData?.model_engine_cyl ? 
      vehicleData.model_engine_cyl + "-cylinder" : 
      "",
    type: vehicleData?.model_engine_type || fuelType.toLowerCase()
  };
  
  // Vehicle body and dimensions info - combine data from both APIs
  const bodyInfo = {
    type: vehicleData?.model_body || nhtsvData?.vehicleType || "stylish",
    doors: vehicleData?.model_doors ? `${vehicleData.model_doors}-door` : "",
    seats: vehicleData?.model_seats ? `${vehicleData.model_seats}-seater` : "comfortable",
    drive: vehicleData?.model_drive ? vehicleData.model_drive.toUpperCase() : ""
  };
  
  // Premium adjectives for vehicle descriptions
  const adjectives = [
    'stunning', 'elegant', 'powerful', 'sleek', 'exceptional',
    'luxurious', 'stylish', 'reliable', 'dynamic', 'premium',
    'impressive', 'refined', 'sophisticated', 'meticulously crafted',
    'prestigious', 'exquisite', 'immaculate', 'distinguished', 'iconic',
    'breathtaking', 'extraordinary', 'magnificent', 'state-of-the-art',
    'captivating', 'outstanding', 'remarkable', 'unparalleled', 'majestic'
  ];
  
  // Performance descriptors
  const performanceTerms = [
    'responsive handling', 'smooth acceleration', 'precise cornering',
    'confident braking', 'nimble maneuverability', 'stable at highway speeds',
    'quiet operation', 'effortless performance', 'impressive fuel efficiency',
    'exceptional ride quality', 'superior road grip', 'dynamic driving experience',
    'instant throttle response', 'perfect weight distribution', 'exhilarating power delivery',
    'race-inspired performance', 'whisper-quiet cabin', 'commanding presence',
    'athletic stance', 'agile cornering ability', 'seamless power transfer'
  ];
  
  // Advanced features by vehicle segment
  const advancedFeatures = [
    'cutting-edge technology', 'advanced driver assistance systems', 
    'superior comfort features', 'impressive performance capabilities',
    'state-of-the-art entertainment system', 'exceptional handling',
    'smart connectivity options', 'innovative safety features',
    'advanced climate control', 'premium sound system',
    'intuitive infotainment system', 'adaptive cruise control',
    'wireless charging capabilities', 'immersive audio experience',
    'autonomous driving features', 'panoramic views',
    'ambient interior lighting', 'ventilated massage seats',
    'heads-up display', 'voice-activated controls',
    'intelligent parking assistance', 'night vision capability',
    'surround-view camera system', 'premium leather upholstery'
  ];
  
  // Condition-specific text with more detail
  const conditionText = {
    'New': `Brand new ${year} ${brand} ${model} with full factory warranty and zero previous owners.`,
    'Used': `Well-maintained ${year} ${brand} ${model} with ${mileage ? `only ${mileage} kilometers and ` : ''}complete service history.`,
    'Certified Pre-Owned': `Certified pre-owned ${year} ${brand} ${model} that has passed our rigorous 150-point inspection and comes with an extended warranty for your peace of mind.`
  };
  
  // Helper functions for random selection
  const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];
  
  // Build detailed descriptions using actual vehicle data where available
  return [
    // Original 4 descriptions
    `The ${year} ${name} is a ${bodyInfo.doors} ${bodyInfo.type} vehicle featuring a ${engineData.displacement} ${engineData.cylinders} ${engineData.type} engine producing ${engineData.horsepower}. ${conditionText[condition]} This ${randomItem(adjectives)} vehicle delivers exceptional performance with its responsive ${transmission.toLowerCase()} transmission${bodyInfo.drive ? ` and ${bodyInfo.drive} drivetrain` : ''}, offering ${randomItem(performanceTerms)} in all driving conditions.`,
    
    `Experience true automotive excellence with this ${randomItem(adjectives)} ${year} ${name}. ${conditionText[condition]} Equipped with a ${engineData.displacement} ${engineData.type} engine and ${transmission.toLowerCase()} transmission, this ${bodyInfo.seats} vehicle offers both comfort and performance, wrapped in a sophisticated design that turns heads everywhere you go.`,
    
    `This ${year} ${name} represents the perfect balance of style and functionality. ${conditionText[condition]} The ${engineData.displacement} ${engineData.cylinders} engine delivers ${engineData.horsepower} of exhilarating power, while ${randomItem(advancedFeatures)} ensures a premium driving experience. Whether navigating city streets or cruising on the highway, this vehicle offers confidence and comfort in equal measure.`,
    
    `Looking for a vehicle that stands out? This ${randomItem(adjectives)} ${year} ${name} is the perfect choice. ${conditionText[condition]} With its ${engineData.displacement} ${engineData.type} engine, ${transmission.toLowerCase()} transmission, and ${randomItem(advancedFeatures)}, it offers an unmatched driving experience that combines performance, comfort, and style in one impressive package.`,
    
    // 10 NEW descriptions
    `Introducing the ${randomItem(adjectives)} ${year} ${brand} ${model}, a masterpiece of automotive engineering. ${conditionText[condition]} This ${bodyInfo.type} boasts a ${engineData.displacement} ${engineData.cylinders} engine that provides ${randomItem(performanceTerms)} and remarkable efficiency. The cabin features ${randomItem(advancedFeatures)} and ${randomItem(advancedFeatures)}, creating an environment of luxury and technological sophistication.`,
    
    `The ${year} ${brand} ${model} redefines what you should expect from a modern vehicle. ${conditionText[condition]} Powered by a ${engineData.displacement} ${engineData.type} engine with ${engineData.horsepower}, this ${transmission.toLowerCase()} ${bodyInfo.type} delivers ${randomItem(performanceTerms)} that will impress even the most discerning drivers. Inside, you'll find ${randomItem(advancedFeatures)} complemented by premium materials throughout the thoughtfully designed interior.`,
    
    `Elevate your driving experience with this ${randomItem(adjectives)} ${year} ${name}. ${conditionText[condition]} The ${engineData.cylinders} ${engineData.type} powerplant produces ${engineData.horsepower} of refined performance, while the ${transmission.toLowerCase()} transmission ensures ${randomItem(performanceTerms)}. This ${bodyInfo.seats} ${bodyInfo.type} combines striking exterior design with a meticulously crafted interior featuring ${randomItem(advancedFeatures)}.`,
    
    `Discover uncompromising luxury and performance with the ${year} ${brand} ${model}. ${conditionText[condition]} Featuring a ${engineData.displacement} ${engineData.cylinders} engine that delivers ${randomItem(performanceTerms)}, this ${bodyInfo.type} ${bodyInfo.drive ? `with ${bodyInfo.drive} drivetrain` : ''} offers a driving experience that's both exhilarating and refined. The cabin showcases ${randomItem(advancedFeatures)} and ${randomItem(advancedFeatures)}, setting new standards for comfort and technology.`,
    
    `The ${randomItem(adjectives)} ${year} ${name} represents the pinnacle of automotive design and engineering. ${conditionText[condition]} Its ${engineData.displacement} ${engineData.type} engine produces ${engineData.horsepower}, delivering ${randomItem(performanceTerms)} that will transform every journey. Inside, the ${bodyInfo.seats} cabin features ${randomItem(advancedFeatures)}, creating an atmosphere of sophisticated luxury and technological innovation.`,
    
    `Prepare to be impressed by the ${year} ${brand} ${model}, a vehicle that excels in every category. ${conditionText[condition]} The ${engineData.displacement} ${engineData.cylinders} ${engineData.type} engine combines with a precision-engineered ${transmission.toLowerCase()} transmission to deliver ${randomItem(performanceTerms)}. This ${bodyInfo.type} features ${randomItem(advancedFeatures)} and ${randomItem(advancedFeatures)}, ensuring every drive is as comfortable as it is exhilarating.`,
    
    `This ${randomItem(adjectives)} ${year} ${name} represents automotive excellence at its finest. ${conditionText[condition]} Engineered with a ${engineData.displacement} ${engineData.type} engine producing ${engineData.horsepower}, this ${bodyInfo.type} delivers ${randomItem(performanceTerms)} in all driving situations. The premium interior features ${randomItem(advancedFeatures)}, creating a harmonious balance of luxury, technology, and comfort.`,
    
    `Experience the road like never before in this ${randomItem(adjectives)} ${year} ${brand} ${model}. ${conditionText[condition]} Its ${engineData.displacement} ${engineData.cylinders} engine delivers an impressive combination of power and efficiency, while its ${transmission.toLowerCase()} transmission ensures ${randomItem(performanceTerms)}. The ${bodyInfo.seats} cabin is equipped with ${randomItem(advancedFeatures)} and ${randomItem(advancedFeatures)}, making every journey an experience to remember.`,
    
    `The ${year} ${brand} ${model} stands as a testament to automotive innovation. ${conditionText[condition]} With its ${engineData.displacement} ${engineData.type} engine generating ${engineData.horsepower}, this ${bodyInfo.type} delivers ${randomItem(performanceTerms)} that will exceed your expectations. The thoughtfully designed interior showcases ${randomItem(advancedFeatures)}, creating an environment where technology and comfort exist in perfect harmony.`,
    
    `This ${randomItem(adjectives)} ${year} ${name} redefines excellence in its class. ${conditionText[condition]} Powered by a sophisticated ${engineData.displacement} ${engineData.cylinders} engine and featuring a responsive ${transmission.toLowerCase()} transmission, it offers ${randomItem(performanceTerms)} that transforms every drive. The cabin is appointed with ${randomItem(advancedFeatures)} and premium materials throughout, creating a space where luxury and functionality coexist perfectly.`
  ];
};

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaCar />
        <span>Add New Vehicle</span>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Vehicle Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Toyota Camry LE"
            required
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Brand</label>
          {loading ? (
            <div className="w-full p-3 border rounded-lg bg-gray-50">
              Loading brands...
            </div>
          ) : (
            <div className="relative">
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option 
                    key={brand._id} 
                    value={brand.name}
                    data-logo={brand.logo}
                  >
                    {brand.name}
                  </option>
                ))}
              </select>
              {formData.brand && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-8">
                  {brands.find(b => b.name === formData.brand)?.logo && (
                    <img
                      src={brands.find(b => b.name === formData.brand).logo}
                      alt={formData.brand}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Camry"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear() + 1}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Mileage (km)</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 50000"
            required
          />
        </div>
      </div>

      {/* Price Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Price ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Down Payment ($)</label>
          <input
            type="number"
            name="downPayment"
            value={formData.downPayment}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Monthly Payment ($)</label>
          <input
            type="number"
            name="monthlyPayment"
            value={formData.monthlyPayment}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Condition</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Certified Pre-Owned">Certified Pre-Owned</option>
          </select>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Transmission</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
            <option value="CVT">CVT</option>
          </select>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium mb-2">Fuel Type</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
          placeholder="Detailed description of the vehicle..."
          required
        />
        
        {/* Enhanced Description Suggestions with Loading State */}
        {formData.brand && formData.model && formData.year && (
          <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                Description Suggestions
              </p>
              
              {loadingVehicleData && (
                <div className="flex items-center text-blue-600">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs">Loading vehicle data...</span>
                </div>
              )}
            </div>
            
            {apiErrors.length > 0 && !loadingVehicleData && (
              <div className="text-xs text-amber-600 mb-2">
                <p>Limited data available. Suggestions may be generic.</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {generateDescriptionSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({...formData, description: suggestion})}
                  className="text-xs px-3 py-1.5 bg-white hover:bg-blue-50 
                           text-gray-800 hover:text-blue-600 rounded-full transition-colors
                           border border-gray-200 hover:border-blue-200 shadow-sm"
                >
                  {suggestion.length > 40 ? suggestion.substring(0, 40) + '...' : suggestion}
                </button>
              ))}
            </div>
            
            {(vehicleData || nhtsvData) && (
              <p className="text-xs text-gray-500 mt-1">
                Suggestions based on technical data for {formData.year} {formData.brand} {formData.model}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-2">Features</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {commonFeatures.map(feature => (
            <div key={feature} className="flex items-center">
              <input
                type="checkbox" // Added type="checkbox"
                id={feature}    // Added id for label association
                checked={formData.features.includes(feature)}
                onChange={() => toggleFeature(feature)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                           focus:ring-blue-500 focus:ring-2"
              />
              <label 
                htmlFor={feature} 
                className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
              >
                {feature}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Media Upload */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-4">Vehicle Images (Upload up to 8)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={`image-${index}`} className="relative">
                <label className="block w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  {image ? (
                    <div className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Vehicle ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const newImages = [...images];
                          newImages[index] = null;
                          setImages(newImages);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FaCloudUploadAlt className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Image {index + 1}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e, index)}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-4">Vehicle Videos</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <div key={`video-${index}`} className="relative">
                <label className="block w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center h-full">
                    <FaVideo className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {video ? `Video ${index + 1} Selected` : `Upload Video ${index + 1}`}
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => handleVideoChange(e, index)}
                    accept="video/*"
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={uploading}
          className={`
            px-6 py-3 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors
            flex items-center gap-2
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {uploading ? 'Listing Vehicle...' : 'List Vehicle'}
        </button>
      </div>
    </form>
  );
};

export default Add;
