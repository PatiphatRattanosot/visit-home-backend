import mongoose, { Schema, Document } from "mongoose"

const VisitInfoSchema: Schema = new Schema({
  home_img: { type: String, required: true },
  home_description: { type: String,required: true },
  family_img: { type: String, required: true },
  family_description: { type: String, required: true },
  comment: { type: String, required: true },
});

const VisitInfoModel = mongoose.model("VisitInfo", VisitInfoSchema);

export default VisitInfoModel;