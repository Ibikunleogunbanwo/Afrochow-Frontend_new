'use client';

import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoriesAndBanner from '@/components/home/CategoriesAndBanner';
import VendorCTASimple from '@/components/home/vendorcta';
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
import TopRestaurants from '@/components/home/Toprestaurants';
import PopularRestaurants from '@/components/home/Popularrestaurants';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

// Location search is now in the navbar (Header.jsx) and writes to LocationContext.
// All three section components read city + coordinates from LocationContext directly.

const Home = () => {
    return (
        <AuthModalProvider>
            <div>
                <HeroSection />
                <CategoriesAndBanner />
                <FeaturedRestaurants />
                <TopRestaurants />
                <PopularRestaurants />
                <VendorCTASimple />
            </div>
        </AuthModalProvider>
    );
};

export default Home;