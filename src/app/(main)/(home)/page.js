'use client';

import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoriesAndBanner from '@/components/home/CategoriesAndBanner';
import VendorCTASimple from '@/components/home/vendorcta';
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
import TopRestaurants from '@/components/home/Toprestaurants';
import PopularRestaurants from '@/components/home/Popularrestaurants';
import LocationSearchInput from '@/components/LocationSearchInput';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

// Single shared location input instance — passed as a prop slot into each
// section that needs it so behaviour (city + coordinates update) is uniform
// across all three components from one source of truth.
const sharedLocationInput = (
    <LocationSearchInput placeholder="Enter city, address or postal code…" />
);

const Home = () => {
    return (
        <AuthModalProvider>
            <div>
                <HeroSection />
                <CategoriesAndBanner />
                <FeaturedRestaurants locationInput={sharedLocationInput} />
                <TopRestaurants     locationInput={sharedLocationInput} />
                <PopularRestaurants locationInput={sharedLocationInput} />
                <VendorCTASimple />
            </div>
        </AuthModalProvider>
    );
};

export default Home;