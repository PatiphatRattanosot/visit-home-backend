import mongoose, { Schema, Document } from "mongoose"

export interface IVisitInfo extends Document {
  student_id: Schema.Types.ObjectId | string;
  teacher_id: Schema.Types.ObjectId | string;
  year_id: Schema.Types.ObjectId | string;
  home_img: string;
  home_description: string;
  family_img: string;
  family_description: string;
  comment: string;
}

const VisitInfoSchema: Schema = new Schema<IVisitInfo>({
  student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  teacher_id: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  year_id: { type: Schema.Types.ObjectId, ref: "Year", required: true },
  home_img: { type: String, required: true },
  home_description: { type: String,required: true },
  family_img: { type: String, required: true },
  family_description: { type: String, required: true },
  comment: { type: String, required: true },
});

const VisitInfoModel = mongoose.model<IVisitInfo>("Visit-Info", VisitInfoSchema);

export default VisitInfoModel;
