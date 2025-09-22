import { Schema, Document } from "mongoose";
import UserModel from "./user_model";

interface ITeacher extends Document {
  email: string;
  first_name: string;
  last_name: string;
  prefix: string;
  role: string[];
  user_id: string;
  phone: string;
  status: string;
  class_id: Schema.Types.ObjectId | string;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    phone: { type: String, required: false, },
    status: { type: String, default: "ใช้งานอยู่", },
    class_id: { type: Schema.Types.ObjectId, ref: "Class", },
  },
  {
    timestamps: true,
  }
);
const TeacherModel = UserModel.discriminator("Teacher", TeacherSchema);
export default TeacherModel;
export { ITeacher };
