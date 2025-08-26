import { Schema, model, Document } from "mongoose";

const SDQCRITERIA = [0, 1, 2];

const SDQSchema = new Schema(
  {
    status: { type: Boolean, default: false },
    student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    year_id: { type: Schema.Types.ObjectId, ref: "Year", required: true },
    comment: { type: String, default: "" },
    assessor: { type: String, enum: ["Teacher", "Student", "Parent"] },
    question: {
      question_1: { type: Number, enum: SDQCRITERIA },
      question_2: { type: Number, enum: SDQCRITERIA },
      question_3: { type: Number, enum: SDQCRITERIA },
      question_4: { type: Number, enum: SDQCRITERIA },
      question_5: { type: Number, enum: SDQCRITERIA },
      question_6: { type: Number, enum: SDQCRITERIA },
      question_7: { type: Number, enum: SDQCRITERIA },
      question_8: { type: Number, enum: SDQCRITERIA },
      question_9: { type: Number, enum: SDQCRITERIA },
      question_10: { type: Number, enum: SDQCRITERIA },
      question_11: { type: Number, enum: SDQCRITERIA },
      question_12: { type: Number, enum: SDQCRITERIA },
      question_13: { type: Number, enum: SDQCRITERIA },
      question_14: { type: Number, enum: SDQCRITERIA },
      question_15: { type: Number, enum: SDQCRITERIA },
      question_16: { type: Number, enum: SDQCRITERIA },
      question_17: { type: Number, enum: SDQCRITERIA },
      question_18: { type: Number, enum: SDQCRITERIA },
      question_19: { type: Number, enum: SDQCRITERIA },
      question_20: { type: Number, enum: SDQCRITERIA },
      question_21: { type: Number, enum: SDQCRITERIA },
      question_22: { type: Number, enum: SDQCRITERIA },
      question_23: { type: Number, enum: SDQCRITERIA },
      question_24: { type: Number, enum: SDQCRITERIA },
      question_25: { type: Number, enum: SDQCRITERIA },
    },
  },
  { timestamps: true }
);

const SDQModel = model("SDQ", SDQSchema);
export default SDQModel;