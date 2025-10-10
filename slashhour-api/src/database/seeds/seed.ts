import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Business, BusinessCategory, SubscriptionTier } from '../../businesses/entities/business.entity';
import { Deal, DealStatus } from '../../deals/entities/deal.entity';
import { Follow, FollowStatus } from '../../follows/entities/follow.entity';

export async function seed(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const businessRepository = dataSource.getRepository(Business);
  const dealRepository = dataSource.getRepository(Deal);
  const followRepository = dataSource.getRepository(Follow);

  console.log('🌱 Starting database seeding...');

  // Note: dropSchema in DataSource config will clear all tables

  // Create Users
  console.log('👤 Creating users...');
  const password = await bcrypt.hash('password123', 10);

  const users = await userRepository.save([
    {
      email: 'john@example.com',
      username: 'johndoe',
      password_hash: password,
      full_name: 'John Doe',
      phone: '+1234567890',
      default_location: { lat: 40.7128, lng: -74.0060 }, // New York
      default_radius_km: 5,
    },
    {
      email: 'jane@example.com',
      username: 'janesmith',
      password_hash: password,
      full_name: 'Jane Smith',
      phone: '+1234567891',
      default_location: { lat: 40.7580, lng: -73.9855 }, // Times Square
      default_radius_km: 10,
    },
    {
      email: 'mike@example.com',
      username: 'mikebrown',
      password_hash: password,
      full_name: 'Mike Brown',
      phone: '+1234567892',
      default_location: { lat: 40.7489, lng: -73.9680 }, // Queens
      default_radius_km: 8,
    },
  ]);

  // Create Businesses
  console.log('🏢 Creating businesses...');
  const businesses = await businessRepository.save([
    {
      owner_id: users[0].id,
      business_name: 'The Gourmet Bistro',
      slug: 'gourmet-bistro',
      description: 'Fine dining with seasonal ingredients',
      category: BusinessCategory.RESTAURANT,
      subcategory: 'Fine Dining',
      location: { lat: 40.7614, lng: -73.9776 }, // Manhattan
      address: '123 Broadway Ave',
      city: 'New York',
      state_province: 'NY',
      country: 'US',
      postal_code: '10001',
      phone: '+12125551234',
      email: 'contact@gourmetbistro.com',
      website: 'https://gourmetbistro.com',
      hours: {
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' },
      },
      is_verified: true,
      subscription_tier: SubscriptionTier.ESSENTIAL,
    },
    {
      owner_id: users[1].id,
      business_name: 'Fresh Market Grocers',
      slug: 'fresh-market-grocers',
      description: 'Your neighborhood grocery store with fresh produce daily',
      category: BusinessCategory.GROCERY,
      location: { lat: 40.7489, lng: -73.9680 },
      address: '456 Queens Blvd',
      city: 'Queens',
      state_province: 'NY',
      country: 'US',
      postal_code: '11101',
      phone: '+17185551234',
      email: 'info@freshmarket.com',
      is_verified: true,
      subscription_tier: SubscriptionTier.CHAMPION,
    },
    {
      owner_id: users[0].id,
      business_name: 'Tech Haven Electronics',
      slug: 'tech-haven',
      description: 'Latest gadgets and electronics at unbeatable prices',
      category: BusinessCategory.ELECTRONICS,
      location: { lat: 40.7580, lng: -73.9855 },
      address: '789 Tech Street',
      city: 'New York',
      state_province: 'NY',
      country: 'US',
      postal_code: '10036',
      phone: '+12125555678',
      email: 'support@techhaven.com',
      website: 'https://techhaven.com',
      is_verified: true,
      subscription_tier: SubscriptionTier.ANCHOR,
    },
    {
      owner_id: users[2].id,
      business_name: 'Style & Fashion Boutique',
      slug: 'style-fashion-boutique',
      description: 'Trendy clothing and accessories for every occasion',
      category: BusinessCategory.FASHION,
      location: { lat: 40.7410, lng: -73.9897 },
      address: '321 Fashion Ave',
      city: 'Brooklyn',
      state_province: 'NY',
      country: 'US',
      postal_code: '11201',
      phone: '+17185559012',
      email: 'hello@stylefashion.com',
      is_verified: false,
      subscription_tier: SubscriptionTier.FREE,
    },
    {
      owner_id: users[1].id,
      business_name: 'Beauty Bliss Spa',
      slug: 'beauty-bliss-spa',
      description: 'Pamper yourself with our luxury spa treatments',
      category: BusinessCategory.BEAUTY,
      location: { lat: 40.7690, lng: -73.9823 },
      address: '555 Spa Lane',
      city: 'New York',
      state_province: 'NY',
      country: 'US',
      postal_code: '10023',
      phone: '+12125553456',
      email: 'info@beautybliss.com',
      is_verified: true,
      subscription_tier: SubscriptionTier.ESSENTIAL,
    },
  ]);

  // Create Deals
  console.log('💰 Creating deals...');
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  await dealRepository.save([
    // Active deals
    {
      business_id: businesses[0].id,
      title: '50% OFF Lunch Special - All Pasta Dishes',
      description: 'Enjoy our handmade pasta at half price during lunch hours (11 AM - 3 PM)',
      original_price: 28.00,
      discounted_price: 14.00,
      category: 'restaurant',
      tags: ['lunch', 'pasta', 'italian'],
      starts_at: lastWeek,
      expires_at: nextWeek,
      is_flash_deal: false,
      visibility_radius_km: 5,
      quantity_available: 50,
      quantity_redeemed: 12,
      max_per_user: 2,
      terms_conditions: ['Valid for dine-in only', 'Cannot be combined with other offers'],
      valid_days: '1111100', // Mon-Fri
      status: DealStatus.ACTIVE,
    },
    {
      business_id: businesses[1].id,
      title: 'FLASH SALE: 30% OFF All Fresh Produce',
      description: 'Stock up on fresh fruits and vegetables - today only!',
      original_price: 50.00,
      discounted_price: 35.00,
      category: 'grocery',
      tags: ['fresh', 'produce', 'healthy', 'flash'],
      starts_at: now,
      expires_at: tomorrow,
      is_flash_deal: true,
      visibility_radius_km: 10,
      terms_conditions: ['While supplies last', 'Minimum purchase $20'],
      status: DealStatus.ACTIVE,
    },
    {
      business_id: businesses[2].id,
      title: 'Wireless Headphones - 40% OFF',
      description: 'Premium noise-cancelling wireless headphones',
      original_price: 299.99,
      discounted_price: 179.99,
      category: 'electronics',
      tags: ['audio', 'wireless', 'premium'],
      starts_at: lastWeek,
      expires_at: nextWeek,
      is_flash_deal: false,
      visibility_radius_km: 15,
      quantity_available: 25,
      quantity_redeemed: 8,
      max_per_user: 1,
      images: [
        { url: 'https://example.com/headphones1.jpg', order: 1 },
        { url: 'https://example.com/headphones2.jpg', order: 2 },
      ],
      status: DealStatus.ACTIVE,
    },
    {
      business_id: businesses[3].id,
      title: 'Summer Collection - Buy 2 Get 1 Free',
      description: 'Mix and match from our latest summer collection',
      original_price: 120.00,
      discounted_price: 80.00,
      category: 'fashion',
      tags: ['clothing', 'summer', 'sale'],
      starts_at: lastWeek,
      expires_at: nextWeek,
      is_flash_deal: false,
      visibility_radius_km: 8,
      terms_conditions: ['Lower priced item is free', 'In-store only'],
      status: DealStatus.ACTIVE,
    },
    {
      business_id: businesses[4].id,
      title: 'Spa Day Package - 60% OFF',
      description: 'Full day spa experience: massage, facial, manicure & pedicure',
      original_price: 250.00,
      discounted_price: 100.00,
      category: 'beauty',
      tags: ['spa', 'relaxation', 'wellness'],
      starts_at: now,
      expires_at: nextWeek,
      is_flash_deal: false,
      visibility_radius_km: 10,
      quantity_available: 20,
      quantity_redeemed: 5,
      max_per_user: 1,
      terms_conditions: ['Booking required', 'Valid Mon-Thu only'],
      valid_days: '1111000', // Mon-Thu
      status: DealStatus.ACTIVE,
    },
    {
      business_id: businesses[0].id,
      title: 'Weekend Brunch Buffet - 35% OFF',
      description: 'Unlimited brunch buffet with mimosas',
      original_price: 45.00,
      discounted_price: 29.25,
      category: 'restaurant',
      tags: ['brunch', 'buffet', 'weekend'],
      starts_at: now,
      expires_at: nextWeek,
      is_flash_deal: false,
      visibility_radius_km: 5,
      terms_conditions: ['Weekends only', '2 hour seating limit'],
      valid_days: '0000011', // Sat-Sun
      status: DealStatus.ACTIVE,
    },
    {
      business_id: businesses[2].id,
      title: 'FLASH: Smart Home Bundle - 50% OFF',
      description: 'Complete smart home starter kit',
      original_price: 399.99,
      discounted_price: 199.99,
      category: 'electronics',
      tags: ['smart-home', 'bundle', 'flash'],
      starts_at: now,
      expires_at: tomorrow,
      is_flash_deal: true,
      visibility_radius_km: 20,
      quantity_available: 10,
      quantity_redeemed: 3,
      max_per_user: 1,
      status: DealStatus.ACTIVE,
    },
  ]);

  // Create Follow relationships
  console.log('👥 Creating follow relationships...');
  await followRepository.save([
    {
      user_id: users[0].id,
      business_id: businesses[1].id,
      status: FollowStatus.ACTIVE,
      notify_new_deals: true,
      notify_flash_deals: true,
    },
    {
      user_id: users[0].id,
      business_id: businesses[2].id,
      status: FollowStatus.ACTIVE,
      notify_new_deals: true,
      notify_flash_deals: false,
    },
    {
      user_id: users[1].id,
      business_id: businesses[0].id,
      status: FollowStatus.ACTIVE,
      notify_new_deals: true,
      notify_flash_deals: true,
    },
    {
      user_id: users[1].id,
      business_id: businesses[4].id,
      status: FollowStatus.MUTED,
      notify_new_deals: false,
      notify_flash_deals: false,
    },
    {
      user_id: users[2].id,
      business_id: businesses[0].id,
      status: FollowStatus.ACTIVE,
      notify_new_deals: true,
      notify_flash_deals: true,
    },
    {
      user_id: users[2].id,
      business_id: businesses[3].id,
      status: FollowStatus.ACTIVE,
      notify_new_deals: true,
      notify_flash_deals: false,
    },
  ]);

  // Update business stats
  console.log('📊 Updating business statistics...');
  for (const business of businesses) {
    const dealCount = await dealRepository.count({ where: { business_id: business.id } });
    const followerCount = await followRepository.count({
      where: {
        business_id: business.id,
        status: FollowStatus.ACTIVE
      }
    });

    business.total_deals_posted = dealCount;
    business.follower_count = followerCount;
    await businessRepository.save(business);
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`
  Created:
  - ${users.length} users
  - ${businesses.length} businesses
  - 7 deals
  - 6 follow relationships

  Test credentials:
  - Email: john@example.com / Password: password123
  - Email: jane@example.com / Password: password123
  - Email: mike@example.com / Password: password123
  `);
}
