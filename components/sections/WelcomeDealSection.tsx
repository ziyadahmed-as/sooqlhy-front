import React from 'react';
import SectionWrapper from '@/components/sections/SectionWrapper';

/**
 * Section for special discounted welcome deals.
 * Backend endpoint: `/api/products/welcome-deal`
 */
const WelcomeDealSection: React.FC = () => (
  <SectionWrapper title="Welcome Deals" endpoint="/api/products/welcome-deal" />
);

export default WelcomeDealSection;
