'use client';

import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoriesAndBanner from '@/components/home/CategoriesAndBanner';
import VendorCTASimple from '@/components/home/vendorcta';
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
import TopRestaurants from '@/components/home/Toprestaurants';
import PopularRestaurants from '@/components/home/Popularrestaurants';
import { LocationProvider } from '@/contexts/LocationContext';

const Home = () => {
    return (
        <LocationProvider>
            <div>
                <HeroSection />
                <CategoriesAndBanner />
                <FeaturedRestaurants />
                <TopRestaurants />
                <PopularRestaurants />
                <VendorCTASimple />
            </div>
        </LocationProvider>
    );
};

export default Home;
