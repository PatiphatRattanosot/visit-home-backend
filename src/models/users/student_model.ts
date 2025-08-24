import { Schema } from "mongoose";
import UserModel from "./user_model";
import { IStudent, IYearlyData } from "./student_interface";

// สร้าง schema สำหรับข้อมูลย่อยแต่ละกลุ่ม
const PersonalInfoSchema = new Schema(
  {
    father_prefix: String,
    father_name: String,
    father_last_name: String,
    father_phone: String,
    father_job: String,
    mother_prefix: String,
    mother_name: String,
    mother_last_name: String,
    mother_phone: String,
    mother_job: String,
    family_relation_status: Number,
    parent_prefix: String,
    parent_name: String,
    parent_last_name: String,
    parent_phone: String,
    parent_job: String,
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const RelationInfoSchema = new Schema(
  {
    family_member: Number,
    family_time: Number,
    father_relation: String,
    mother_relation: String,
    brother_relation: String,
    sister_relation: String,
    grand_parent_relation: String,
    relatives_relation: String,
    other_relative: String,
    other_relation: String,
    when_student_alone: String,
    total_household_income: Number,
    daily_total_to_school: Number,
    received_daily_from: String,
    student_part_time: String,
    student_income: Number,
    support_from_school: String,
    support_from_organize: String,
    parent_concern: String,
  },
  { _id: false }
);

const FamilyStatusInfoSchema = new Schema(
  {
    household_burdens: [String],
    housing_type: String,
    housing_condition: String,
    family_vehicles: [String],
    less_than_one: String,
    owned_land: Number,
    rented_land: Number,
  },
  { _id: false }
);

const BehaviorAndRiskSchema = new Schema(
  {
    health_risk: [String],
    welfare_and_safety: [String],
    distance_to_school: Number,
    time_used: Number,
    school_transport: String,
    student_resp: [String],
    student_resp_other: String,
    hobbies: [String],
    other_hobbies: String,
    drugs_behav: [String],
    violent_behav: [String],
    other_violent_behav: String,
    sexual_behav: [String],
    gaming_behav: [String],
    other_gaming_behav: String,
    computer_internet_access: String,
    tech_use_behav: String,
    information_giver: String,
  },
  { _id: false }
);

// สร้าง YearlyDataSchema สำหรับเก็บข้อมูลรายปี
const YearlyDataSchema = new Schema(
  {
    year: { type: Schema.Types.ObjectId, ref: "Year", required: true },
    personal_info: PersonalInfoSchema,
    relation_info: RelationInfoSchema,
    family_status_info: FamilyStatusInfoSchema,
    behavior_and_risk: BehaviorAndRiskSchema,
  },
  { _id: false }
);

// สร้าง StudentSchema โดยเก็บข้อมูลหลักและ yearly_data
const StudentSchema = new Schema(
  {
    user_id: { type: String, required: true, unique: true },
    class_id: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    image_url: { type: String, default: "" },
    yearly_data: [YearlyDataSchema],
  },
  {
    timestamps: true,
  }
);

// ใช้ discriminator เพื่อสืบทอดจาก UserModel
const StudentModel = UserModel.discriminator<IStudent>(
  "Student",
  StudentSchema
);
export default StudentModel;