require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Address = require('./models/Address');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const Payment = require('./models/Payment');

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/shopsphere';
    console.log(`Connecting to MongoDB for seeding: ${connStr}...`);
    await mongoose.connect(connStr);
    console.log('Connected! Purging existing collections...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Address.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Payment.deleteMany({}),
    ]);
    console.log('Cleared existing database records.');

    // 1. Seed Users
    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'ShopSphere Administrator',
      email: 'admin@shopsphere.com',
      password: 'Admin@12345',
      role: 'admin',
      phone: '+1 (800) 555-0199',
      avatar: {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      },
    });

    const demoCustomer1 = await User.create({
      name: 'Alex Johnson',
      email: 'customer@example.com',
      password: 'Customer@12345',
      role: 'customer',
      phone: '+1 (555) 234-5678',
      avatar: {
        url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      },
    });

    const demoCustomer2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      password: 'Sarah@12345',
      role: 'customer',
      phone: '+1 (555) 876-5432',
      avatar: {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      },
    });

    // 2. Seed Addresses
    console.log('Seeding Addresses...');
    const customer1Address = await Address.create({
      user: demoCustomer1._id,
      fullName: 'Alex Johnson',
      phone: '+1 (555) 234-5678',
      street: '742 Evergreen Terrace',
      landmark: 'Near Springfield Elementary',
      city: 'Springfield',
      state: 'Oregon',
      postalCode: '97477',
      country: 'United States',
      isDefault: true,
      addressType: 'home',
    });

    await Address.create({
      user: demoCustomer1._id,
      fullName: 'Alex Johnson (Office)',
      phone: '+1 (555) 234-9999',
      street: '100 Silicon Way, Tech Tower Floor 4',
      landmark: 'Next to Central Park Metro',
      city: 'Portland',
      state: 'Oregon',
      postalCode: '97201',
      country: 'United States',
      isDefault: false,
      addressType: 'work',
    });

    // 3. Seed Categories
    console.log('Seeding Categories...');
    const categoriesData = [
      {
        name: 'Electronics & Audio',
        slug: 'electronics-audio',
        description: 'Next-gen audio, smart devices, wearable tech, and premium accessories.',
        image: {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        },
        isFeatured: true,
        displayOrder: 1,
      },
      {
        name: 'Fashion & Apparel',
        slug: 'fashion-apparel',
        description: 'Timeless outerwear, everyday essentials, and modern streetwear.',
        image: {
          url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
        },
        isFeatured: true,
        displayOrder: 2,
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Minimalist decor, ergonomic workspace essentials, and home comfort.',
        image: {
          url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        },
        isFeatured: true,
        displayOrder: 3,
      },
      {
        name: 'Beauty & Wellness',
        slug: 'beauty-wellness',
        description: 'Organic skincare, aromatherapy diffusers, and daily wellness items.',
        image: {
          url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        },
        isFeatured: true,
        displayOrder: 4,
      },
      {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Performance training gear, adventure backpacks, and hydration systems.',
        image: {
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        },
        isFeatured: true,
        displayOrder: 5,
      },
      {
        name: 'Books & Workspace',
        slug: 'books-workspace',
        description: 'Productivity journals, architectural desk accessories, and stationeries.',
        image: {
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        },
        isFeatured: true,
        displayOrder: 6,
      },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.slug] = c._id;
      // Also map by name and hyphen variants for resilience
      catMap[c.name] = c._id;
      if (c.slug && c.slug.includes('-and-')) {
        catMap[c.slug.replace(/-and-/g, '-')] = c._id;
      }
    });

    // 4. Seed Products (28 realistic items across 6 categories)
    console.log('Seeding 28 Curated Products...');
    const productsData = [
      // Electronics & Audio
      {
        name: 'AcousticPro Studio Wireless Noise-Cancelling Headphones',
        brand: 'SoundSphere',
        category: catMap['electronics-audio'],
        price: 299,
        discountPrice: 249,
        stock: 45,
        isFeatured: true,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Active noise cancellation with 40-hour battery life and custom audio tuning.',
        description:
          'Experience high-fidelity sound engineered with custom-tuned 40mm titanium drivers. Features dual hybrid Active Noise Cancellation (ANC), transparency mode, multi-point Bluetooth 5.3 connectivity, and plush memory foam ear cushions for all-day listening bliss.',
        images: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80', isPrimary: false },
        ],
        ratings: { average: 4.8, count: 128 },
        specifications: [
          { key: 'Driver Size', value: '40mm Titanium' },
          { key: 'Battery Life', value: 'Up to 40 Hours' },
          { key: 'Connectivity', value: 'Bluetooth 5.3 + 3.5mm Aux' },
          { key: 'Weight', value: '260g' },
        ],
      },
      {
        name: 'AuraSound Compact 360° Waterproof Bluetooth Speaker',
        brand: 'Aura',
        category: catMap['electronics-audio'],
        price: 89,
        discountPrice: 69,
        stock: 80,
        isFeatured: true,
        isTrending: true,
        isNewArrival: true,
        shortDescription: 'IPX7 waterproof 360-degree room-filling acoustic speaker with punchy bass.',
        description:
          'Crafted for adventures indoors and outdoors. Delivers rich, omnidirectional 360-degree sound with deep passive bass radiators. Rugged IPX7 waterproof housing withstands splashes, rain, and submersion.',
        images: [
          { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.6, count: 64 },
        specifications: [
          { key: 'Water Resistance', value: 'IPX7 Rated' },
          { key: 'Playtime', value: '14 Hours' },
          { key: 'Charging', value: 'USB Type-C Fast Charge' },
        ],
      },
      {
        name: 'Apex Precision Wireless Ergonomic Mouse',
        brand: 'TechCraft',
        category: catMap['electronics-audio'],
        price: 79,
        discountPrice: 59,
        stock: 50,
        isFeatured: false,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Sculpted ergonomic contour with silent magnetic scroll wheel and dual connection.',
        description:
          'Designed to support natural forearm posture, eliminating wrist fatigue during extended working hours. Supports 4,000 DPI sensor tracking on virtually any surface including glass.',
        images: [
          { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.7, count: 89 },
        specifications: [
          { key: 'DPI Range', value: '200 to 4000 DPI' },
          { key: 'Battery', value: 'Rechargeable 500mAh Li-Po' },
          { key: 'Compatibility', value: 'Windows, macOS, iPadOS, Linux' },
        ],
      },
      {
        name: 'Nova Pro Mechanical Keyboard with Gateron Switches',
        brand: 'KeyForge',
        category: catMap['electronics-audio'],
        price: 149,
        discountPrice: 129,
        stock: 35,
        isFeatured: true,
        isTrending: false,
        isNewArrival: true,
        shortDescription: 'Hot-swappable 75% layout mechanical keyboard with sound-dampening gasket mount.',
        description:
          'Features factory-lubed switches, PBT double-shot keycaps, south-facing RGB illumination, and aluminum top frame. Connect seamlessly via 2.4GHz wireless, Bluetooth 5.1, or USB-C cable.',
        images: [
          { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.9, count: 42 },
        specifications: [
          { key: 'Layout', value: '75% Compact (84 Keys)' },
          { key: 'Switches', value: 'Gateron G Pro Brown Tactile' },
          { key: 'Keycaps', value: 'Cherry Profile PBT' },
        ],
      },
      {
        name: 'Horizon Smart Fitness Watch Ultra Titanium',
        brand: 'Horizon',
        category: catMap['electronics-audio'],
        price: 349,
        discountPrice: 299,
        stock: 22,
        isFeatured: true,
        isTrending: true,
        isNewArrival: true,
        shortDescription: 'Sapphire crystal display with GPS tracking, ECG sensor, and 100m water resistance.',
        description:
          'Precision aerospace-grade titanium case paired with ultra-bright 2000 nits AMOLED display. Delivers comprehensive health analytics including continuous heart rate, SpO2 blood oxygen, body temperature, and deep sleep stages.',
        images: [
          { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 96 },
        specifications: [
          { key: 'Case Material', value: 'Titanium Grade 5' },
          { key: 'Display', value: '1.43" AMOLED Sapphire Glass' },
          { key: 'Water Rating', value: '10 ATM (100 Meters)' },
        ],
      },

      // Fashion & Apparel
      {
        name: 'Nordic Heritage Merino Wool Crewneck Sweater',
        brand: 'Kavalier',
        category: catMap['fashion-apparel'],
        price: 120,
        discountPrice: 95,
        stock: 30,
        isFeatured: true,
        isTrending: false,
        isNewArrival: true,
        shortDescription: '100% extra-fine Australian Merino wool sweater with ribbed collar and cuffs.',
        description:
          'Naturally temperature-regulating and moisture-wicking. Made with responsibly sourced merino fibers spun into an exceptionally soft, pill-resistant knit suitable for casual layering or business meetings.',
        images: [
          { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.7, count: 53 },
        specifications: [
          { key: 'Material', value: '100% Extra-fine Merino Wool' },
          { key: 'Care', value: 'Hand Wash or Dry Clean Only' },
          { key: 'Fit', value: 'Modern Tailored Fit' },
        ],
      },
      {
        name: 'Urban Transit Weatherproof Commuter Jacket',
        brand: 'AeroCraft',
        category: catMap['fashion-apparel'],
        price: 189,
        discountPrice: 159,
        stock: 40,
        isFeatured: true,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Windproof, water-resistant shell with magnetic closures and hidden security pocket.',
        description:
          'Designed for city dwellers navigating unpredictable weather. Triple-layer breathable membrane seals out moisture while maintaining airflow. Features discreet reflective accents for nighttime safety.',
        images: [
          { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 77 },
        specifications: [
          { key: 'Fabric', value: '3-Layer DWR Polyamide' },
          { key: 'Zippers', value: 'YKK Aquaguard' },
          { key: 'Insulation', value: 'PrimaLoft Eco 60g' },
        ],
      },
      {
        name: 'Classic Selvedge Raw Denim Jeans',
        brand: 'DenimForge',
        category: catMap['fashion-apparel'],
        price: 135,
        discountPrice: 115,
        stock: 25,
        isFeatured: false,
        isTrending: true,
        isNewArrival: false,
        shortDescription: '14oz Japanese shuttle-loom woven raw selvedge denim in slim-straight silhouette.',
        description:
          'Woven slowly on heritage shuttle looms in Okayama, Japan. Features custom brass hardware, vegetable-tanned leather patch, and red selvedge ID that develops a personalized fade patina over time.',
        images: [
          { url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.9, count: 38 },
        specifications: [
          { key: 'Denim Weight', value: '14 oz' },
          { key: 'Weave', value: 'Right Hand Twill Selvedge' },
          { key: 'Cotton', value: '100% Long-Staple Cotton' },
        ],
      },
      {
        name: 'Artisan Full-Grain Leather Minimalist Wallet',
        brand: 'Kavalier',
        category: catMap['fashion-apparel'],
        price: 55,
        discountPrice: 45,
        stock: 60,
        isFeatured: false,
        isTrending: false,
        isNewArrival: true,
        shortDescription: 'Handcrafted vegetable-tanned leather bifold with RFID blocking protection.',
        description:
          'Slim silhouette holds up to 10 cards and folded bills without pocket bulk. Saddle-stitched by hand with waxed linen thread for a lifetime of dependable daily use.',
        images: [
          { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.6, count: 91 },
        specifications: [
          { key: 'Leather', value: 'Italian Full-Grain Vegetable Tanned' },
          { key: 'RFID', value: 'Integrated 13.56MHz Shield' },
          { key: 'Capacity', value: '8-10 Cards + Cash Pocket' },
        ],
      },
      {
        name: 'Classic Polarized Titanium Aviator Sunglasses',
        brand: 'Lumina',
        category: catMap['fashion-apparel'],
        price: 165,
        discountPrice: 139,
        stock: 35,
        isFeatured: false,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Ultralight titanium frames with scratch-resistant polarized CR-39 lenses.',
        description:
          'A classic reimagined with modern materials. Weighing a mere 18 grams, the titanium construction provides supreme comfort with zero temple pressure, while 100% UVA/UVB polarized optics ensure crisp, glare-free vision.',
        images: [
          { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.7, count: 62 },
        specifications: [
          { key: 'Frame', value: 'Grade 2 Pure Titanium' },
          { key: 'Lens', value: 'Polarized CR-39 (Category 3)' },
          { key: 'UV Protection', value: 'UV400 Total Block' },
        ],
      },

      // Home & Living
      {
        name: 'Minimalist Ceramic Pour-Over Coffee Brewer Set',
        brand: 'Studio Terra',
        category: catMap['home-living'],
        price: 48,
        discountPrice: null,
        stock: 45,
        isFeatured: true,
        isTrending: false,
        isNewArrival: true,
        shortDescription: 'Hand-thrown matte ceramic dripper with 600ml borosilicate glass serving carafe.',
        description:
          'Elevate your morning ritual with intentional design. Engineered with interior spiral ribs to optimize water flow and extraction rates, unlocking subtle floral and caramel notes in single-origin beans.',
        images: [
          { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 85 },
        specifications: [
          { key: 'Carafe Volume', value: '600 ml (20 oz)' },
          { key: 'Material', value: 'High-fire Stoneware + Borosilicate' },
          { key: 'Filter Type', value: 'Standard Cone 02 Paper' },
        ],
      },
      {
        name: 'Nordic Solid Walnut Ergonomic Desk Shelf & Monitor Riser',
        brand: 'Studio Terra',
        category: catMap['home-living'],
        price: 159,
        discountPrice: 129,
        stock: 18,
        isFeatured: true,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Hand-sanded solid American walnut dual monitor stand with aluminum shelf legs.',
        description:
          'Transforms your desk into an organized, ergonomic workstation. Elevates monitors to natural eye level while providing dedicated storage underneath for keyboard, notebooks, and audio interfaces.',
        images: [
          { url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.9, count: 54 },
        specifications: [
          { key: 'Wood', value: 'FSC-Certified Solid American Walnut' },
          { key: 'Dimensions', value: '46" L x 9" W x 4.2" H' },
          { key: 'Weight Capacity', value: '80 lbs (Dual Mon.' },
        ],
      },
      {
        name: 'Amber Glass Ultrasonic Aromatherapy Diffuser',
        brand: 'AromaPure',
        category: catMap['home-living'],
        price: 65,
        discountPrice: 49,
        stock: 55,
        isFeatured: false,
        isTrending: true,
        isNewArrival: true,
        shortDescription: 'Whisper-quiet ultrasonic mister encased in hand-blown textured fluted amber glass.',
        description:
          'Disperses botanical essential oils without heat to preserve therapeutic properties. Features subtle warm ambient glow, auto-shutoff timer modes (1h, 3h, 6h), and coverage up to 400 sq ft.',
        images: [
          { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.7, count: 110 },
        specifications: [
          { key: 'Tank Capacity', value: '250 ml' },
          { key: 'Run Time', value: 'Up to 10 Hours Continuous' },
          { key: 'Noise Level', value: '< 20 dB' },
        ],
      },
      {
        name: 'Handwoven Chunky Weighted Cotton Blanket',
        brand: 'Haven',
        category: catMap['home-living'],
        price: 175,
        discountPrice: 145,
        stock: 20,
        isFeatured: true,
        isTrending: false,
        isNewArrival: false,
        shortDescription: '15-pound open-knit breathable weighted blanket made from 100% organic cotton.',
        description:
          'Naturally calm anxiety and promote restorative deep sleep. The wide chunky knit design evenly distributes weight without synthetic bead fillers, allowing continuous airflow to keep you cool year-round.',
        images: [
          { url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 47 },
        specifications: [
          { key: 'Weight', value: '15 lbs (6.8 kg)' },
          { key: 'Dimensions', value: '48" x 72" (Twin / Queen Throw)' },
          { key: 'Fabric', value: 'GOTS Organic Ring-Spun Cotton' },
        ],
      },

      // Beauty & Wellness
      {
        name: 'Botanical Radiance Vitamin C Serum with Hyaluronic Acid',
        brand: 'Lumina Skin',
        category: catMap['beauty-wellness'],
        price: 42,
        discountPrice: 34,
        stock: 90,
        isFeatured: true,
        isTrending: true,
        isNewArrival: true,
        shortDescription: 'Potent 15% THD Ascorbate antioxidant serum to brighten and firm dull complexion.',
        description:
          'Clinical strength yet gentle on sensitive barriers. Blended with ferulic acid, botanical hyaluronic acid, and organic sea buckthorn oil to fight free radicals, fade hyperpigmentation, and impart instant dewiness.',
        images: [
          { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.9, count: 180 },
        specifications: [
          { key: 'Size', value: '30 ml (1 fl oz)' },
          { key: 'Active Ingredients', value: '15% Vitamin C, Ferulic, HA' },
          { key: 'Formula', value: '100% Vegan & Cruelty-Free' },
        ],
      },
      {
        name: 'Natural Rose Quartz Facial Sculpting Gua Sha & Roller',
        brand: 'Lumina Skin',
        category: catMap['beauty-wellness'],
        price: 28,
        discountPrice: null,
        stock: 75,
        isFeatured: false,
        isTrending: false,
        isNewArrival: true,
        shortDescription: 'Authentic Brazilian rose quartz stones for lymphatic drainage and facial tension relief.',
        description:
          'Carved from grade-A genuine rose quartz crystal. Relieves jaw tension, reduces morning facial puffiness, and encourages deeper absorption of facial oils and moisturizers.',
        images: [
          { url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.6, count: 95 },
        specifications: [
          { key: 'Stone', value: '100% Brazilian Rose Quartz' },
          { key: 'Frame', value: 'Reinforced Zinc Alloy (No squeaking)' },
        ],
      },
      {
        name: 'Organic Restorative Night Facial Oil with Blue Tansy',
        brand: 'Lumina Skin',
        category: catMap['beauty-wellness'],
        price: 52,
        discountPrice: 44,
        stock: 40,
        isFeatured: false,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Calming overnight treatment oil packed with blue tansy, squalane, and jojoba.',
        description:
          'Rich in chamazulene, the deep blue oil soothes redness, calms irritated blemishes, and balances sebum production overnight for plump, revitalized skin by morning.',
        images: [
          { url: 'https://images.unsplash.com/photo-1608248597359-5613532b40a9?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 68 },
        specifications: [
          { key: 'Volume', value: '50 ml' },
          { key: 'Skin Type', value: 'All skin types including blemish-prone' },
        ],
      },

      // Sports & Outdoors
      {
        name: 'Vanguard 32L Adventure Waterproof Roll-Top Backpack',
        brand: 'Vanguard',
        category: catMap['sports-outdoors'],
        price: 169,
        discountPrice: 139,
        stock: 35,
        isFeatured: true,
        isTrending: true,
        isNewArrival: true,
        shortDescription: 'IPX6 submersible TPU roll-top pack with ergonomic harness and laptop compartment.',
        description:
          'Engineered for alpine treks and rainy commutes. 840D ballistic nylon welded with thermoplastic polyurethane keeps camera gear, clothes, and laptop bone-dry even in torrential downpours.',
        images: [
          { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.9, count: 82 },
        specifications: [
          { key: 'Capacity', value: '32 Liters' },
          { key: 'Material', value: '840D Ballistic TPU' },
          { key: 'Laptop Fit', value: 'Up to 16" MacBook Pro' },
        ],
      },
      {
        name: 'HydroShield Double-Wall Insulated Steel Flask 1000ml',
        brand: 'Vanguard',
        category: catMap['sports-outdoors'],
        price: 36,
        discountPrice: 28,
        stock: 120,
        isFeatured: false,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Keeps liquids ice cold for 24 hours or piping hot for 12 hours. Sweat-free powder coat.',
        description:
          'Built with 18/8 food-grade pro-steel that never transfers flavors. Wide mouth facilitates easy ice cube loading and effortless cleaning.',
        images: [
          { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 145 },
        specifications: [
          { key: 'Volume', value: '1000 ml (34 oz)' },
          { key: 'Insulation', value: 'TempShield Vacuum Seal' },
          { key: 'BPA Free', value: '100% Non-Toxic' },
        ],
      },
      {
        name: 'CloudFoam High-Density Non-Slip Yoga Mat with Carry Strap',
        brand: 'Zenith',
        category: catMap['sports-outdoors'],
        price: 58,
        discountPrice: 48,
        stock: 65,
        isFeatured: false,
        isTrending: false,
        isNewArrival: true,
        shortDescription: '6mm natural tree rubber base with moisture-absorbent polyurethane top surface.',
        description:
          'Zero slipping even during high-intensity hot yoga sessions. Laser-etched alignment system assists in proper positioning of hands and feet during complex postures.',
        images: [
          { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.7, count: 73 },
        specifications: [
          { key: 'Thickness', value: '6 mm' },
          { key: 'Material', value: 'Natural Rubber + Eco PU' },
          { key: 'Dimensions', value: '72" L x 26" W' },
        ],
      },
      {
        name: 'CarbonFiber Ultralight Trekking Poles (Pair)',
        brand: 'Vanguard',
        category: catMap['sports-outdoors'],
        price: 85,
        discountPrice: 69,
        stock: 28,
        isFeatured: false,
        isTrending: false,
        isNewArrival: false,
        shortDescription: '100% 3K carbon fiber quick-lock telescoping poles with ergonomic cork grips.',
        description:
          'Absorbs shock on knee joints during steep mountain descents. Moisture-wicking natural cork handles mold to the shape of your hand for secure grip in all weather conditions.',
        images: [
          { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.6, count: 39 },
        specifications: [
          { key: 'Weight', value: '7.8 oz per pole' },
          { key: 'Length Range', value: '25" to 54" Telescoping' },
        ],
      },

      // Books & Workspace
      {
        name: 'The Architectural Mind: Creative Systems for Complex Design',
        brand: 'Sphinx Press',
        category: catMap['books-workspace'],
        price: 38,
        discountPrice: null,
        stock: 50,
        isFeatured: true,
        isTrending: false,
        isNewArrival: true,
        shortDescription: 'Hardcover collector edition exploring spatial philosophy and modern computational design.',
        description:
          'A masterwork examining the intersection of physical architecture, computer algorithms, and human psychology. Filled with full-color diagrams, sketches, and case studies.',
        images: [
          { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.9, count: 61 },
        specifications: [
          { key: 'Format', value: 'Hardcover with Embossed Foil' },
          { key: 'Pages', value: '384 Pages' },
          { key: 'Language', value: 'English' },
        ],
      },
      {
        name: 'Minimalist Brass Executive Rollerball Fountain Pen',
        brand: 'Kavalier Atelier',
        category: catMap['books-workspace'],
        price: 68,
        discountPrice: 54,
        stock: 45,
        isFeatured: false,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Solid machined raw brass body with German-engineered iridium medium nib.',
        description:
          'Heavier in hand for effortless line control. The untreated raw brass acquires a distinctive vintage patina unique to each writer over time.',
        images: [
          { url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 52 },
        specifications: [
          { key: 'Material', value: 'Machined Solid Brass' },
          { key: 'Nib', value: '0.7mm Medium Iridium Tip' },
          { key: 'Refill', value: 'Standard International Cartridge' },
        ],
      },
      {
        name: 'Quarterly Goal & Habit Hardcover Focus Planner',
        brand: 'FocusLab',
        category: catMap['books-workspace'],
        price: 29,
        discountPrice: 22,
        stock: 85,
        isFeatured: false,
        isTrending: false,
        isNewArrival: true,
        shortDescription: 'Undated 90-day productivity journal with 120gsm fountain-pen friendly paper.',
        description:
          'Structured frameworks based on cognitive research to break complex annual objectives into weekly actionable milestones and daily deep-work routines.',
        images: [
          { url: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.7, count: 88 },
        specifications: [
          { key: 'Paper', value: '120 GSM Acid-Free Ivory' },
          { key: 'Binding', value: 'Lay-Flat Thread Bound' },
          { key: 'Pages', value: '224 Pages' },
        ],
      },
      {
        name: 'Architectural Aluminum LED Desk Lamp with Wireless Charger',
        brand: 'Studio Terra',
        category: catMap['books-workspace'],
        price: 119,
        discountPrice: 99,
        stock: 30,
        isFeatured: true,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Dual-pivot articulated arm with 5 color temperatures and 15W Qi charging base.',
        description:
          'Flicker-free high CRI (>95) diffused light panel prevents eye strain during late-night designing. Built-in fast wireless charging pedestal keeps your phone charged without cables.',
        images: [
          { url: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 43 },
        specifications: [
          { key: 'CRI Rating', value: '> 95 True Color Render' },
          { key: 'Color Temp', value: '2700K to 6500K Tunable' },
          { key: 'Wireless Pad', value: '15W Fast Charge' },
        ],
      },
      {
        name: 'AeroSound Pro True Wireless Earbuds with ANC',
        brand: 'SoundSphere',
        category: catMap['electronics-audio'],
        price: 179,
        discountPrice: 149,
        stock: 60,
        isFeatured: true,
        isTrending: true,
        isNewArrival: true,
        shortDescription: 'Spatial audio with head tracking, active noise cancellation, and wireless charging case.',
        description:
          'Compact earbuds engineered for immersive acoustics. Features 6 beamforming microphones for crystal-clear calls, IPX5 sweat resistance, and seamless switching between laptop and phone.',
        images: [
          { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.7, count: 112 },
        specifications: [
          { key: 'Battery Life', value: '8h buds / 32h with case' },
          { key: 'Audio Codecs', value: 'LDAC, AAC, SBC' },
          { key: 'Rating', value: 'IPX5 Water Resistant' },
        ],
      },
      {
        name: 'Organic Bamboo Charcoal Air Purifying Pillow',
        brand: 'Haven',
        category: catMap['home-living'],
        price: 65,
        discountPrice: 49,
        stock: 40,
        isFeatured: false,
        isTrending: false,
        isNewArrival: true,
        shortDescription: 'Contoured memory foam pillow infused with bamboo charcoal for odor neutralization.',
        description:
          'Ergonomic contour cradles cervical spine for proper alignment whether sleeping on your back or side. The cooling gel layer keeps your head comfortable throughout the night.',
        images: [
          { url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.6, count: 34 },
        specifications: [
          { key: 'Core', value: 'Bamboo Charcoal Infused Foam' },
          { key: 'Cover', value: 'Washable Breathable Bamboo Viscose' },
        ],
      },
      {
        name: 'Titanium Camping French Press Coffee Maker',
        brand: 'Vanguard',
        category: catMap['sports-outdoors'],
        price: 59,
        discountPrice: null,
        stock: 45,
        isFeatured: false,
        isTrending: true,
        isNewArrival: false,
        shortDescription: 'Ultralight 750ml pure titanium pot and French press for backcountry coffee.',
        description:
          'Doubles as a direct-flame boiling pot and French press. Pure titanium leaves zero metallic taste and weighs only 200 grams, making it essential for trail coffee connoisseurs.',
        images: [
          { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', isPrimary: true },
        ],
        ratings: { average: 4.8, count: 29 },
        specifications: [
          { key: 'Material', value: '100% Grade 1 Titanium' },
          { key: 'Capacity', value: '750 ml' },
          { key: 'Weight', value: '7.1 oz (200g)' },
        ],
      },
    ];

    // Verify that every product has a valid Category ObjectId reference
    const missingCategoryProducts = productsData.filter((p) => !p.category);
    if (missingCategoryProducts.length > 0) {
      const failedNames = missingCategoryProducts.map((p) => `"${p.name}"`).join(', ');
      throw new Error(`Seeding aborted: Missing category reference for product(s): ${failedNames}`);
    }

    const createdProducts = await Product.insertMany(productsData);
    console.log(`Successfully seeded ${createdProducts.length} products!`);

    // 5. Seed Promotional Coupons
    console.log('Seeding Active Coupons...');
    await Coupon.create([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 50,
        maxDiscountAmount: 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        usageLimit: 500,
        usedCount: 24,
        isActive: true,
      },
      {
        code: 'FLAT50',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 200,
        maxDiscountAmount: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        usageLimit: 200,
        usedCount: 15,
        isActive: true,
      },
      {
        code: 'SPHERE25',
        discountType: 'percentage',
        discountValue: 25,
        minOrderAmount: 100,
        maxDiscountAmount: 75,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usedCount: 8,
        isActive: true,
      },
    ]);

    // 6. Seed Sample Orders with Snapshots
    console.log('Seeding Sample Orders...');
    const p1 = createdProducts[0];
    const p2 = createdProducts[1];
    const p3 = createdProducts[4];

    const sampleOrder1 = await Order.create({
      user: demoCustomer1._id,
      items: [
        {
          product: p1._id,
          name: p1.name,
          sku: p1.sku,
          image: p1.images[0].url,
          price: p1.discountPrice || p1.price,
          quantity: 1,
          subtotal: p1.discountPrice || p1.price,
        },
        {
          product: p2._id,
          name: p2.name,
          sku: p2.sku,
          image: p2.images[0].url,
          price: p2.discountPrice || p2.price,
          quantity: 1,
          subtotal: p2.discountPrice || p2.price,
        },
      ],
      shippingAddress: {
        fullName: customer1Address.fullName,
        phone: customer1Address.phone,
        street: customer1Address.street,
        landmark: customer1Address.landmark,
        city: customer1Address.city,
        state: customer1Address.state,
        postalCode: customer1Address.postalCode,
        country: customer1Address.country,
      },
      paymentMethod: 'razorpay',
      paymentStatus: 'completed',
      paymentDetails: {
        razorpayOrderId: 'order_seed_demo_001',
        razorpayPaymentId: 'pay_seed_demo_001',
        razorpaySignature: 'sig_verified_demo',
      },
      orderStatus: 'Delivered',
      pricing: {
        itemsTotal: (p1.discountPrice || p1.price) + (p2.discountPrice || p2.price),
        shippingFee: 0,
        tax: 25.44,
        discount: 31.8,
        totalAmount: 311.64,
      },
      couponApplied: {
        code: 'WELCOME10',
        discountAmount: 31.8,
      },
      statusTimeline: [
        { status: 'Pending', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Order placed by customer.' },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000), note: 'Payment verified via Razorpay.' },
        { status: 'Processing', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), note: 'Picked and packed in fulfillment warehouse.' },
        { status: 'Shipped', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Dispatched with carrier tracking #TRK-98234-SPH.' },
        { status: 'Out for Delivery', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'With courier driver.' },
        { status: 'Delivered', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 14400000), note: 'Delivered at front porch.' },
      ],
    });

    const sampleOrder2 = await Order.create({
      user: demoCustomer1._id,
      items: [
        {
          product: p3._id,
          name: p3.name,
          sku: p3.sku,
          image: p3.images[0].url,
          price: p3.discountPrice || p3.price,
          quantity: 1,
          subtotal: p3.discountPrice || p3.price,
        },
      ],
      shippingAddress: {
        fullName: customer1Address.fullName,
        phone: customer1Address.phone,
        street: customer1Address.street,
        landmark: customer1Address.landmark,
        city: customer1Address.city,
        state: customer1Address.state,
        postalCode: customer1Address.postalCode,
        country: customer1Address.country,
      },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'Shipped',
      pricing: {
        itemsTotal: p3.discountPrice || p3.price,
        shippingFee: 0,
        tax: 23.92,
        discount: 0,
        totalAmount: 322.92,
      },
      statusTimeline: [
        { status: 'Confirmed', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Order placed with Cash on Delivery.' },
        { status: 'Processing', timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), note: 'Processed at hub.' },
        { status: 'Shipped', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), note: 'Shipped via Express Express Air.' },
      ],
    });

    // 7. Seed Reviews
    console.log('Seeding Reviews...');
    await Review.create({
      product: p1._id,
      user: demoCustomer1._id,
      order: sampleOrder1._id,
      isVerifiedPurchase: true,
      rating: 5,
      title: 'Best studio wireless headphones I have ever owned',
      comment:
        'The soundstage on these headphones is genuinely remarkable. The active noise cancellation drowns out city street noise completely, and the battery really did last almost the entire week on a single charge. 10/10 recommend!',
      isApproved: true,
    });

    await Review.create({
      product: p2._id,
      user: demoCustomer1._id,
      order: sampleOrder1._id,
      isVerifiedPurchase: true,
      rating: 5,
      title: 'Punchy bass and indestructible build',
      comment:
        'Took this on a kayak trip down the river. Got splashed thoroughly with water and kept playing crisp audio without missing a beat.',
      isApproved: true,
    });

    // 8. Seed Wishlist & Cart for Demo User
    console.log('Seeding Wishlist & Cart for demo user...');
    await Wishlist.create({
      user: demoCustomer1._id,
      products: [createdProducts[3]._id, createdProducts[6]._id, createdProducts[10]._id],
    });

    await Cart.create({
      user: demoCustomer1._id,
      items: [
        {
          product: createdProducts[3]._id,
          quantity: 1,
          price: createdProducts[3].discountPrice || createdProducts[3].price,
        },
      ],
    });

    console.log('\n========================================================');
    console.log('✅ ShopSphere Database Seed Completed Successfully!');
    console.log('========================================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@shopsphere.com');
    console.log('  Password: Admin@12345');
    console.log('--------------------------------------------------------');
    console.log('Demo Customer:');
    console.log('  Email:    customer@example.com');
    console.log('  Password: Customer@12345');
    console.log('--------------------------------------------------------');
    console.log('Promotional Coupons:');
    console.log('  WELCOME10  -> 10% off ($50 min order)');
    console.log('  FLAT50     -> $50 flat discount ($200 min order)');
    console.log('  SPHERE25   -> 25% off up to $75');
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Failure] ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();
