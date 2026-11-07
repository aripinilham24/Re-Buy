import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const conversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    lastMessage: String,
    lastMessageAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

conversationSchema.index({ lastMessageAt: -1 });

export type Conversation = InferSchemaType<typeof conversationSchema>;
export type ConversationDocument = HydratedDocument<Conversation>;

export default model<Conversation>("Conversation", conversationSchema);
