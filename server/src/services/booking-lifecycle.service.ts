import { Booking, type BookingDocument } from "../models/Booking.js";
import { Vehicle } from "../models/Vehicle.js";
import { ApiError } from "../utils/ApiError.js";
import { chatService } from "./chat.service.js";
import { resolveUploadValue } from "../utils/cloudinary.js";

export interface HandoverInput {
  bookingId: string;
  photos: {
    front: string;
    back: string;
    side: string;
    dashboard: string;
    fuelLevel: string;
  };
  notes?: string;
}

export interface ReturnInput {
  bookingId: string;
  photos: {
    front: string;
    back: string;
    side: string;
    dashboard: string;
    fuelLevel: string;
  };
  notes?: string;
}

export class BookingLifecycleService {
  /**
   * Start the handover process (Provider initiates)
   */
  async initiateHandover(bookingId: string, providerId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound("Booking not found");

    if (booking.status !== "CONFIRMED") {
      throw ApiError.unprocessable("Booking must be CONFIRMED to start handover");
    }

    // Notify via chat
    await chatService.sendSystemEvent(bookingId, "Handover process started by owner. Please inspect the vehicle together.", {
      action: "HANDOVER_STARTED",
      initiatedBy: providerId,
    });

    return booking;
  }

  /**
   * Complete handover and move to ACTIVE
   */
  async completeHandover(input: HandoverInput, providerId: string) {
    const booking = await Booking.findById(input.bookingId);
    if (!booking) throw ApiError.notFound("Booking not found");

    if (booking.status !== "CONFIRMED") {
      throw ApiError.unprocessable("Handover can only be completed for CONFIRMED bookings");
    }

    const folder = `auto-rental/bookings/${booking.bookingId}/handover`;
    
    // Upload photos
    const [front, back, side, dashboard, fuelLevel] = await Promise.all([
      resolveUploadValue(input.photos.front, folder, "front"),
      resolveUploadValue(input.photos.back, folder, "back"),
      resolveUploadValue(input.photos.side, folder, "side"),
      resolveUploadValue(input.photos.dashboard, folder, "dashboard"),
      resolveUploadValue(input.photos.fuelLevel, folder, "fuel"),
    ]);

    const handoverData = {
      photos: { front, back, side, dashboard, fuelLevel },
      notes: input.notes,
      completedAt: new Date(),
      completedBy: providerId,
    };

    booking.status = "ACTIVE";
    // We can store this in metadata or a new field. For now, let's use metadata in a system message
    // or we could extend the Booking model. Let's stick to system messages for the "organized chat" feel.
    
    await booking.save();

    await chatService.sendSystemEvent(input.bookingId, "Handover completed. Trip is now ACTIVE. Drive safely!", {
      action: "HANDOVER_COMPLETED",
      handoverData,
    });

    return booking;
  }

  /**
   * Initiate return process (Renter or Provider)
   */
  async initiateReturn(bookingId: string, initiatorId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound("Booking not found");

    if (booking.status !== "ACTIVE") {
      throw ApiError.unprocessable("Booking must be ACTIVE to start return");
    }

    await chatService.sendSystemEvent(bookingId, "Return process initiated. Please perform final inspection.", {
      action: "RETURN_STARTED",
      initiatedBy: initiatorId,
    });

    return booking;
  }

  /**
   * Complete return and move to COMPLETED
   */
  async completeReturn(input: ReturnInput, providerId: string) {
    const booking = await Booking.findById(input.bookingId);
    if (!booking) throw ApiError.notFound("Booking not found");

    if (booking.status !== "ACTIVE") {
      throw ApiError.unprocessable("Return can only be completed for ACTIVE bookings");
    }

    const folder = `auto-rental/bookings/${booking.bookingId}/return`;
    
    // Upload photos
    const [front, back, side, dashboard, fuelLevel] = await Promise.all([
      resolveUploadValue(input.photos.front, folder, "front"),
      resolveUploadValue(input.photos.back, folder, "back"),
      resolveUploadValue(input.photos.side, folder, "side"),
      resolveUploadValue(input.photos.dashboard, folder, "dashboard"),
      resolveUploadValue(input.photos.fuelLevel, folder, "fuel"),
    ]);

    const returnData = {
      photos: { front, back, side, dashboard, fuelLevel },
      notes: input.notes,
      completedAt: new Date(),
      completedBy: providerId,
    };

    booking.status = "COMPLETED";
    booking.actualReturnTime = new Date();
    await booking.save();

    // Update vehicle status back to AVAILABLE
    const vehicle = await Vehicle.findById(booking.vehicleId);
    if (vehicle) {
      vehicle.status = "AVAILABLE";
      await vehicle.save();
    }

    await chatService.sendSystemEvent(input.bookingId, "Vehicle returned successfully. Booking is now COMPLETED.", {
      action: "RETURN_COMPLETED",
      returnData,
    });

    return booking;
  }
}

export const bookingLifecycleService = new BookingLifecycleService();
