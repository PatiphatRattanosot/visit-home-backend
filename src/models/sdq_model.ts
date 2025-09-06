import { Schema, model, Document } from "mongoose";

interface ISDQ extends Document {
  status: boolean;
  student_id: Schema.Types.ObjectId;
  year_id: Schema.Types.ObjectId;
  assessor: string;
  emotional: {
    // Group 1: ด้านอารมณ์ Emotional
    question_3: number;
    question_8: number;
    question_13: number;
    question_16: number;
    question_24: number;
    total_score: number;
  },
  behavioral: {
    // Group 2: ด้านพฤติกรรม Behavioral
    question_5: number;
    question_7: number;
    question_12: number;
    question_18: number;
    question_22: number;
    total_score: number;
  },
  hyperactivity: {
    // Group 3: ด้านสมาธิสั้น Hyperactivity
    question_2: number;
    question_10: number;
    question_15: number;
    question_21: number;
    question_25: number;
    total_score: number;
  },
  friendship: {
    // Group 4: ด้านความสัมพันธ์กับเพื่อน Friendship
    question_6: number;
    question_11: number;
    question_14: number;
    question_19: number;
    question_23: number;
    total_score: number;
  },
  social: {
    // Group 5: ด้านความสัมพันธ์กับสังคม Social
    question_1: number;
    question_4: number;
    question_9: number;
    question_17: number;
    question_20: number;
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


const SDQSchema = new Schema<ISDQ>(
  {
    status: { type: Boolean, default: false },
    student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    year_id: { type: Schema.Types.ObjectId, ref: "Year", required: true },
    assessor: { type: String, enum: ["Teacher", "Student", "Parent"] },
    emotional: {
      question_3: { type: Number, enum: SDQCRITERIA, required: true },
      question_8: { type: Number, enum: SDQCRITERIA, required: true },
      question_13: { type: Number, enum: SDQCRITERIA, required: true },
      question_16: { type: Number, enum: SDQCRITERIA, required: true },
      question_24: { type: Number, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, required: true },
    },
    behavioral: {
      question_5: { type: Number, enum: SDQCRITERIA, required: true },
      question_7: { type: Number, enum: SDQCRITERIA, required: true },
      question_12: { type: Number, enum: SDQCRITERIA, required: true },
      question_18: { type: Number, enum: SDQCRITERIA, required: true },
      question_22: { type: Number, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, required: true  },
    },
    hyperactivity: {
      question_2: { type: Number, enum: SDQCRITERIA, required: true },
      question_10: { type: Number, enum: SDQCRITERIA, required: true },
      question_15: { type: Number, enum: SDQCRITERIA, required: true },
      question_21: { type: Number, enum: SDQCRITERIA, required: true },
      question_25: { type: Number, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, required: true  },
    },
    friendship: {
      question_6: { type: Number, enum: SDQCRITERIA, required: true },
      question_11: { type: Number, enum: SDQCRITERIA, required: true },
      question_14: { type: Number, enum: SDQCRITERIA, required: true },
      question_19: { type: Number, enum: SDQCRITERIA, required: true },
      question_23: { type: Number, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, required: true  },
    },
    social: {
      question_1: { type: Number, enum: SDQCRITERIA, required: true },
      question_4: { type: Number, enum: SDQCRITERIA, required: true },
      question_9: { type: Number, enum: SDQCRITERIA, required: true },
      question_17: { type: Number, enum: SDQCRITERIA, required: true },
      question_20: { type: Number, enum: SDQCRITERIA, required: true },
      total_score: { type: Number, required: true  },
    },

    other: {
      additional: { type: String,  },
      overall_problem: { type: String, enum: ["0", "1", "2", "3"], required: true },
      problem_time: { type: String},
      is_uneasy_student: {
        type: String
      },
      is_annoy_student: {
        type: String
      },
      is_difficult_student: {
        type: String
      },
    },
  },
  { timestamps: true }
);

const SDQModel = model<ISDQ>("SDQ", SDQSchema);
export default SDQModel;
export { ISDQ };
