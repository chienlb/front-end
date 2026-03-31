import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GroupDocument extends Document {
  @Prop({ required: true })
  groupId: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  uploadedBy: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const GroupDocumentSchema = SchemaFactory.createForClass(GroupDocument);