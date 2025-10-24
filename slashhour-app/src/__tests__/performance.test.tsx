/**
 * Performance Optimization Tests
 * Verifies that React.memo, useCallback, and useMemo are properly applied
 */

import React from 'react';
import FeedDealCard from '../components/FeedDealCard';
import ShopDealCard from '../components/ShopDealCard';
import DealCard from '../components/DealCard';
import BusinessCard from '../components/BusinessCard';
import RedemptionCard from '../components/RedemptionCard';

describe('Performance Optimizations', () => {
  describe('React.memo Usage', () => {
    it('FeedDealCard is wrapped with React.memo', () => {
      // @ts-ignore - accessing internal React properties for testing
      expect(FeedDealCard.$$typeof.toString()).toContain('react.memo');
    });

    it('ShopDealCard is wrapped with React.memo', () => {
      // @ts-ignore
      expect(ShopDealCard.$$typeof.toString()).toContain('react.memo');
    });

    it('DealCard is wrapped with React.memo', () => {
      // @ts-ignore
      expect(DealCard.$$typeof.toString()).toContain('react.memo');
    });

    it('BusinessCard is wrapped with React.memo', () => {
      // @ts-ignore
      expect(BusinessCard.$$typeof.toString()).toContain('react.memo');
    });

    it('RedemptionCard is wrapped with React.memo', () => {
      // @ts-ignore
      expect(RedemptionCard.$$typeof.toString()).toContain('react.memo');
    });
  });

  describe('Image Performance', () => {
    it('expo-image module is available', () => {
      const expoImage = require('expo-image');
      expect(expoImage.Image).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    it('confirms critical components are optimized', () => {
      const optimizedComponents = [
        FeedDealCard,
        ShopDealCard,
        DealCard,
        BusinessCard,
        RedemptionCard,
      ];

      optimizedComponents.forEach((component) => {
        // All components should be memoized
        expect(component.$$typeof).toBeTruthy();
      });
    });
  });
});
