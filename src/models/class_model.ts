import { Schema, model, Document, ObjectId } from "mongoose";

export interface IClass extends Document {
  room: number; // ชื่อห้องเรียน
  number: number; // หมายเลขห้องเรียน
  year_id: string; // ปีการศึกษา
  teacher_id: ObjectId | string;
}

const ClassSchema = new Schema<IClass>(
  {
    room: { type: Number, required: true },
    number: { type: Number, required: true },
    year_id: { type: String, required: true },
    teacher_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
);
const ClassModel = model<IClass>("Class", ClassSchema);
export default ClassModel;
