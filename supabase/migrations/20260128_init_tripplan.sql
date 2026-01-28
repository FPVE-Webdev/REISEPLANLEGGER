-- Tripplan Tromsø - Initial Database Schema
-- Created: 2026-01-28

-- POI (Points of Interest) Table
CREATE TABLE IF NOT EXISTS "POI" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "nameNo" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "descriptionNo" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "address" TEXT NOT NULL,
  "seasons" TEXT[],
  "openingHours" JSONB,
  "priceLevel" TEXT NOT NULL,
  "estimatedCost" INTEGER NOT NULL,
  "checkfrontItemId" TEXT,
  "googlePlaceId" TEXT,
  "bookingUrl" TEXT,
  "pilarType" TEXT,
  "featuredPilar" TEXT,
  "essentialThemes" TEXT[],
  "aiWeight" INTEGER NOT NULL DEFAULT 5,
  "imageUrl" TEXT,
  "website" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "duration" INTEGER,
  "bookingRequired" BOOLEAN NOT NULL DEFAULT false,
  "cancellationPolicy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "POI_category_idx" ON "POI"("category");
CREATE INDEX IF NOT EXISTS "POI_priceLevel_idx" ON "POI"("priceLevel");
CREATE INDEX IF NOT EXISTS "POI_aiWeight_idx" ON "POI"("aiWeight");

-- TripPlan Table
CREATE TABLE IF NOT EXISTS "TripPlan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "shareableId" TEXT NOT NULL UNIQUE,
  "preferences" JSONB NOT NULL,
  "plan" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '7 days'),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "TripPlan_shareableId_idx" ON "TripPlan"("shareableId");
CREATE INDEX IF NOT EXISTS "TripPlan_expiresAt_idx" ON "TripPlan"("expiresAt");

-- CheckfrontItem Table
CREATE TABLE IF NOT EXISTS "CheckfrontItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "itemId" TEXT NOT NULL UNIQUE,
  "poiId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NOK',
  "lastSynced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CheckfrontItem_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "POI" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CheckfrontItem_poiId_idx" ON "CheckfrontItem"("poiId");

-- CheckfrontAvailability Table
CREATE TABLE IF NOT EXISTS "CheckfrontAvailability" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "checkfrontItemId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "price" DOUBLE PRECISION NOT NULL,
  "capacity" INTEGER NOT NULL,
  "booked" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CheckfrontAvailability_checkfrontItemId_fkey" FOREIGN KEY ("checkfrontItemId") REFERENCES "CheckfrontItem" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CheckfrontAvailability_checkfrontItemId_idx" ON "CheckfrontAvailability"("checkfrontItemId");
CREATE INDEX IF NOT EXISTS "CheckfrontAvailability_date_idx" ON "CheckfrontAvailability"("date");

-- RestaurantBooking Table
CREATE TABLE IF NOT EXISTS "RestaurantBooking" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "poiId" TEXT NOT NULL,
  "restaurantName" TEXT NOT NULL,
  "bookingPlatform" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "lastSynced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RestaurantBooking_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "POI" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "RestaurantBooking_poiId_idx" ON "RestaurantBooking"("poiId");
CREATE INDEX IF NOT EXISTS "RestaurantBooking_bookingPlatform_idx" ON "RestaurantBooking"("bookingPlatform");

-- RestaurantAvailability Table
CREATE TABLE IF NOT EXISTS "RestaurantAvailability" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "restaurantBookingId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "partySize" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RestaurantAvailability_restaurantBookingId_fkey" FOREIGN KEY ("restaurantBookingId") REFERENCES "RestaurantBooking" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "RestaurantAvailability_restaurantBookingId_idx" ON "RestaurantAvailability"("restaurantBookingId");
CREATE INDEX IF NOT EXISTS "RestaurantAvailability_date_idx" ON "RestaurantAvailability"("date");

-- PilarConfig Table
CREATE TABLE IF NOT EXISTS "PilarConfig" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "weight" INTEGER NOT NULL,
  "associatedPOIs" TEXT[],
  "essentialTheme" TEXT,
  "featuredPilar" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "PilarConfig_type_idx" ON "PilarConfig"("type");

-- SeasonConfig Table
CREATE TABLE IF NOT EXISTS "SeasonConfig" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "season" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "nameNo" TEXT NOT NULL,
  "startMonth" INTEGER NOT NULL,
  "endMonth" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "highlights" TEXT[],
  "weatherInfo" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Category Table
CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "categoryId" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "nameNo" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
