import { Schema } from "mongoose";
import UserModel from "./user_model";
import { IStudent, IYearlyData } from "./student_interface";


// Page 1 Personal Information
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

// Page 2 Relationship Information
const RelationshipInfoSchema = new Schema(
  {
    family_relation_status: String,
    family_member: Number,
    family_time: Number,
    father_relation: String,
    mother_relation: String,
    big_brother_relation: String,
    lil_brother_relation: String,
    big_sister_relation: String,
    lil_sister_relation: String,
    grandparent_relation: String,
    relative_relation: String,
  },
  { _id: false }
);

// Page 3 Family Information
const FamilyInfoSchema = new Schema(
  {
    total_household_income: Number,
    received_daily_from: String,
    daily_total_to_school: Number,
    student_part_time: String,
    student_income: Number,
    household_burdens: [String],
    housing_type: String,
    housing_condition: String,
    family_vehicles: [String],
    owned_land: Number,
    rented_land: Number,
  },
  { _id: false }
);

// Page 4 Behavioral Information
const BehaviorInfoSchema = new Schema(
  {
    student_resp: [String],
    other_student_resp: String,
    hobbies: [String],
    other_hobbies: String,
    drugs_behav: [String],
    violent_behav: [String],
    other_violent_behav: String,
    sexual_behav: [String],
    computer_internet_access: String,
    tech_use_behav: String,
    gaming_behav: [String],
    other_gaming_behav: String,
  },
  { _id: false }
);

// Page 5 Risk Information
const RiskInfoSchema = new Schema(
  {
    when_student_alone: String,
    health_risk: [String],
    welfare_and_safety: [String],
    distance_to_school: Number,
    time_used: Number,
    school_transport: String,
  },
  { _id: false }
);

// Page 6 Additional Information
const AdditionalInfoSchema = new Schema(
  {
    support_from_organize: [String],
    support_from_school: [String],
    parent_concern: String,
  },
  { _id: false }
);

const YearlyDataSchema = new Schema(
  {
    year: { type: Schema.Types.ObjectId, ref: "Year", required: true },
    personal_info: PersonalInfoSchema,
    relationship_info: RelationshipInfoSchema,
    family_info: FamilyInfoSchema,
    behavior_info: BehaviorInfoSchema,
    risk_info: RiskInfoSchema,
    additional_info: AdditionalInfoSchema,
  },
  { _id: false }
);


const StudentSchema = new Schema(
  {
    user_id: { type: String, required: true, unique: true },
    class_id: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    image_url: { type: String, default: "" },
    phone: { type: String, default: "" },
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