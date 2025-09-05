import { Schema, model, Document } from "mongoose";

interface ISDQ extends Document {
  status: boolean;
  student_id: Schema.Types.ObjectId;
  year_id: Schema.Types.ObjectId;
  assessor: string;
  emotional: {
    // Group 1: ด้านอารมณ์ Emotional
    question_3: string;
    question_8: string;
    question_13: string;
    question_16: string;
    question_24: string;
    total_score: number;
  },
  behavioral: {
    // Group 2: ด้านพฤติกรรม Behavioral
    question_5: string;
    question_7: string;
    question_12: string;
    question_18: string;
    question_22: string;
    total_score: number;
  },
  hyperactivity: {
    // Group 3: ด้านสมาธิสั้น Hyperactivity
    question_2: string;
    question_10: string;
    question_15: string;
    question_21: string;
    question_25: string;
    total_score: number;
  },
  friendship: {
    // Group 4: ด้านความสัมพันธ์กับเพื่อน Friendship
    question_6: string;
    question_11: string;
    question_14: string;
    question_19: string;
    question_23: string;
    total_score: number;
  },
  social: {
    // Group 5: ด้านความสัมพันธ์กับสังคม Social
    question_1: string;
    question_4: string;
    question_9: string;
    question_17: string;
    question_20: string;
    total_score: number;
  }
  other: {
    additional: "",
    overall_problem: "", // 0 = ไม่, 1 = ใช่ มีปัญหาเล็กน้อย, 2 = ใช่ มีปัญหาชัดเจน, 3 = ใช่ มีปัญหามาก
    problem_time: "", // 0 = น้อยกว่า 1 เดือน, 1 = 1-5 เดือน, 2 = 6-12 เดือน, 3 = มากกว่า 1 ปี
    is_uneasy_student: "", // 0 = ไม่, 1 = เล็กน้อย, 2 = ค่อนข้างมาก, 3 = มาก
    is_annoy_student: "", // 0 = ไม่, 1 = เล็กน้อย, 2 = ค่อนข้างมาก, 3 = มาก
    is_difficult_student: "", // 0 = ไม่, 1 = เล็กน้อย, 2 = ค่อนข้างมาก, 3 = มาก
  }
}

const SDQCRITERIA = ["0", "1", "2"];
const OTHER = ["0", "1", "2", "3"];

const SDQSchema = new Schema<ISDQ>(
  {
    status: { type: Boolean, default: false },
    student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    year_id: { type: Schema.Types.ObjectId, ref: "Year", required: true },
    assessor: { type: String, enum: ["Teacher", "Student", "Parent"] },
    emotional: {
      question_3: { type: String, enum: SDQCRITERIA, required: true },
      question_8: { type: String, enum: SDQCRITERIA, required: true },
      question_13: { type: String, enum: SDQCRITERIA, required: true },
      question_16: { type: String, enum: SDQCRITERIA, required: true },
      question_24: { type: String, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, default: 0 },
    },
    behavioral: {
      question_5: { type: String, enum: SDQCRITERIA, required: true },
      question_7: { type: String, enum: SDQCRITERIA, required: true },
      question_12: { type: String, enum: SDQCRITERIA, required: true },
      question_18: { type: String, enum: SDQCRITERIA, required: true },
      question_22: { type: String, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, default: 0 },
    },
    hyperactivity: {
      question_2: { type: String, enum: SDQCRITERIA, required: true },
      question_10: { type: String, enum: SDQCRITERIA, required: true },
      question_15: { type: String, enum: SDQCRITERIA, required: true },
      question_21: { type: String, enum: SDQCRITERIA, required: true },
      question_25: { type: String, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, default: 0 },
    },
    friendship: {
      question_6: { type: String, enum: SDQCRITERIA, required: true },
      question_11: { type: String, enum: SDQCRITERIA, required: true },
      question_14: { type: String, enum: SDQCRITERIA, required: true },
      question_19: { type: String, enum: SDQCRITERIA, required: true },
      question_23: { type: String, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, default: 0 },
    },
    social: {
      question_1: { type: String, enum: SDQCRITERIA, required: true },
      question_4: { type: String, enum: SDQCRITERIA, required: true },
      question_9: { type: String, enum: SDQCRITERIA, required: true },
      question_17: { type: String, enum: SDQCRITERIA, required: true },
      question_20: { type: String, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, default: 0 },
    },

    other: {
      additional: { type: String, required: true },
      overall_problem: { type: String, enum: OTHER, required: true },
      problem_time: { type: String, enum: OTHER, required: true },
      is_uneasy_student: {
        type: String,
        enum: OTHER,
        required: true
      },
      is_annoy_student: {
        type: String,
        enum: OTHER,
        required: true
      },
      is_difficult_student: {
        type: String,
        enum: OTHER,
        required: true
      },
    },
  },
  { timestamps: true }
);

const SDQModel = model<ISDQ>("SDQ", SDQSchema);
export default SDQModel;
export { ISDQ };
