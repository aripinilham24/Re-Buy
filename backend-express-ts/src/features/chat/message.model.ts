import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    readAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export type Message = InferSchemaType<typeof messageSchema>;
export type MessageDocument = HydratedDocument<Message>;

export default model<Message>("Message", messageSchema);
