import { Schema, model, Document } from "mongoose";

interface IYear extends Document {
  year: Number; // ปีการศึกษา
  start_schedule_date?: Date; // วันที่เริ่มต้นปีการศึกษา
  end_schedule_date?: Date; // วันที่สิ้นสุดปีการศึกษา
}

const YearSchema = new Schema<IYear>(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
    },
    start_schedule_date: { type: Date, },
    end_schedule_date: { type: Date, },
  },
  {
    timestamps: true,
  }
);
const YearModel = model<IYear>("Year", YearSchema);
export default YearModel;
export { IYear };
