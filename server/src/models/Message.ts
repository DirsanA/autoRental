import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export type MessageSenderType = "User" | "Company" | "System";
export type MessageType = "text" | "event" | "image";

export interface IMessage {
  bookingId: Types.ObjectId;
  senderId?: Types.ObjectId; // System messages might not have a senderId
  senderType: MessageSenderType;
  content: string;
  type: MessageType;
  metadata?: Record<string, any>; // For extra data like image URLs or action data
  createdAt?: Date;
  updatedAt?: Date;
}

export type MessageDocument = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      refPath: "senderType",
    },
    senderType: {
      type: String,
      required: true,
      enum: ["User", "Company", "System"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "event", "image"],
      default: "text",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Performance index for fetching chat history
messageSchema.index({ bookingId: 1, createdAt: 1 });

export const Message = model<IMessage>("Message", messageSchema);
