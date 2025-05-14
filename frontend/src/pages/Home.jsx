import React from 'react'
import Hero from '../components/Hero'
import About1 from '../components/About1'
import Bidding from '../components/Bidding'
import Condition from '../components/Condition'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import PromoSection from '../components/PromoSection'
import ReviewAdvert from '../components/ReviewAdvert'
import VehicleFinderTool from '../components/VehicleFinderTool'
// Import the main FinanceCalculator component
import FinanceCalculator from '../components/FinanceCalculator/FinanceCalculator'

const Home = () => {
  return (
    <div>
      <Hero />
      <About1 />
      <VehicleFinderTool />
      <Bidding />
      {/* Add Finance Calculator with custom section styling */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-4">
              Calculate Your Car Financing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Plan your purchase with our advanced financing tools and find the perfect payment plan for your dream vehicle.
            </p>
          </div>
          <FinanceCalculator />
        </div>
      </section>
      

      <LatestCollection/>
      <BestSeller/>
      
      <ReviewAdvert />
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
