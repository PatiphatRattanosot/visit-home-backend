import { Schema, model, Document } from "mongoose";

interface ISchedule extends Document {
    student_id: Schema.Types.ObjectId | string;
    year_id: Schema.Types.ObjectId | string;
    teacher_id: Schema.Types.ObjectId | string;
    appointment_date: Date;
    status: string;
    comment: string;
}

const ScheduleSchema = new Schema({
    student_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    year_id: { type: Schema.Types.ObjectId, ref: "Year", required: true },
    teacher_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointment_date: { type: Date, required: true },
    status: { type: String, enum: ["Not-scheduled", "Been-set", "Canceled"], default: "Not-scheduled" },
    comment: { type: String },
},{ timestamps: true });

const ScheduleModel = model<ISchedule>("Schedule", ScheduleSchema);
export default ScheduleModel;
export { ISchedule };