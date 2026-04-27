import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Booking } from "../models/Booking.js";
import { Vehicle } from "../models/Vehicle.js";
import { User } from "../models/User.js";
import { walletService } from "../services/wallet.service.js";

let mongo: MongoMemoryServer | null = null;

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "test" });
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test("escrow hold -> release moves pending to available", async () => {
  const host = await User.create({
    email: "host@example.com",
    accountType: "USER",
    verificationLevel: "NONE",
    status: "ACTIVE",
    walletBalance: 0,
    roles: [],
  });

  const renter = await User.create({
    email: "renter@example.com",
    accountType: "USER",
    verificationLevel: "NONE",
    status: "ACTIVE",
    walletBalance: 0,
    roles: [],
  });

  const vehicle = await Vehicle.create({
    ownerId: host._id,
    ownerType: "User",
    make: "Toyota",
    model: "Yaris",
    year: 2020,
    plate: `PLT${Date.now()}`,
    price: 2400,
    features: [],
    status: "AVAILABLE",
  });

  const booking = await Booking.create({
    renterId: renter._id,
    vehicleId: vehicle._id,
    priceSnapshot: {
      pricePerHour: 100,
      totalHours: 10,
      systemCommission: 80,
      totalAmount: 1080,
      currency: "ETB",
    },
    startTime: new Date(Date.now() + 3600_000),
    endTime: new Date(Date.now() + 7200_000),
    withDriver: false,
    status: "CONFIRMED",
    contactPhone: "0912345678",
    isBlocked: false,
    payment: {
      method: "CHAPA",
      status: "PAID",
      tx_ref: `tx-${Date.now()}`,
      paidAt: new Date(),
    },
  });

  await walletService.holdEscrowForPaidBooking(booking);
  const walletAfterHold = await walletService.getWalletByOwner(host._id, "User");
  assert.ok(walletAfterHold);
  assert.equal(walletAfterHold.pendingBalance, 1000);
  assert.equal(walletAfterHold.availableBalance, 0);

  await walletService.releaseEscrowForBooking(booking.id, "COMPLETED");
  const walletAfterRelease = await walletService.getWalletByOwner(host._id, "User");
  assert.ok(walletAfterRelease);
  assert.equal(walletAfterRelease.pendingBalance, 0);
  assert.equal(walletAfterRelease.availableBalance, 1000);
});

test("refund reversal after release can make available negative", async () => {
  const host = await User.create({
    email: `host2-${Date.now()}@example.com`,
    accountType: "USER",
    verificationLevel: "NONE",
    status: "ACTIVE",
    walletBalance: 0,
    roles: [],
  });
  const renter = await User.create({
    email: `renter2-${Date.now()}@example.com`,
    accountType: "USER",
    verificationLevel: "NONE",
    status: "ACTIVE",
    walletBalance: 0,
    roles: [],
  });
  const vehicle = await Vehicle.create({
    ownerId: host._id,
    ownerType: "User",
    make: "Honda",
    model: "Fit",
    year: 2021,
    plate: `PLT${Date.now()}`,
    price: 2400,
    features: [],
    status: "AVAILABLE",
  });
  const booking = await Booking.create({
    renterId: renter._id,
    vehicleId: vehicle._id,
    priceSnapshot: {
      pricePerHour: 100,
      totalHours: 10,
      systemCommission: 80,
      totalAmount: 1080,
      currency: "ETB",
    },
    startTime: new Date(Date.now() + 3600_000),
    endTime: new Date(Date.now() + 7200_000),
    withDriver: false,
    status: "CONFIRMED",
    contactPhone: "0912345678",
    isBlocked: false,
    payment: {
      method: "CHAPA",
      status: "PAID",
      tx_ref: `tx-${Date.now()}`,
      paidAt: new Date(),
    },
  });

  await walletService.holdEscrowForPaidBooking(booking);
  await walletService.releaseEscrowForBooking(booking.id, "COMPLETED");

  // simulate host paid out externally (available decreased)
  const wallet = await walletService.getWalletByOwner(host._id, "User");
  assert.ok(wallet);
  wallet.availableBalance = 100;
  await wallet.save();

  await walletService.applyRefundReversal(booking.id, "AVAILABLE");
  const walletAfterRefund = await walletService.getWalletByOwner(host._id, "User");
  assert.ok(walletAfterRefund);
  assert.equal(walletAfterRefund.availableBalance, -900);
});

