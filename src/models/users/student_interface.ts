
import { Document, ObjectId } from "mongoose";

// Page 1 Personal Information
interface IPersonalInfo {
  father_prefix: string;
  father_name: string;
  father_last_name: string;
  father_phone: string;
  father_job: string;
  mother_prefix: string;
  mother_name: string;
  mother_last_name: string;
  mother_phone: string;
  mother_job: string;
  parent_prefix: string;
  parent_name: string;
  parent_last_name: string;
  parent_phone: string;
  parent_job: string;
  lat: number;
  lng: number;
}

// Page 2 Relationship Information
interface IRelationshipInfo {
  family_relation_status: string;
  family_member: number;
  family_time: number;
  father_relation: string;
  mother_relation: string;
  big_brother_relation: string;
  lil_brother_relation: string;
  big_sister_relation: string;
  lil_sister_relation: string;
  grandparent_relation: string;
  relative_relation: string;
}

// Page 3 Family Information
interface IFamilyInfo {
  total_household_income: number;
  received_daily_from: string;
  daily_total_to_school: number;
  student_part_time: string;
  student_income: number;
  household_burdens: string[];
  housing_type: string;
  housing_condition: string;
  family_vehicles: string[];
  owned_land: number;
  rented_land: number;
}

// Page 4 Behavioral Information
interface IBehaviorInfo {
  student_resp: string[];
  other_student_resp: string;
  hobbies: string[];
  other_hobbies: string;
  drugs_behav: string[];
  violent_behav: string[];
  other_violent_behav: string;
  sexual_behav: string[];
  computer_internet_access: string;
  tech_use_behav: string;
  gaming_behav: string[];
  other_gaming_behav: string;
}

// Page 5 Risk Information
interface IRiskInfo {
  when_student_alone: string;
  health_risk: string[];
  welfare_and_safety: string[];
  distance_to_school: number;
  time_used: number;
  school_transport: string;
}

// Page 6 Additional Information
interface IAdditionalInfo {
  support_from_organize: string[];
  support_from_school: string[];
  parent_concern: string;
}

interface IYearlyData {
  year: ObjectId | string;
  isCompleted: string;
  personal_info: IPersonalInfo;
  relationship_info: IRelationshipInfo;
  family_info: IFamilyInfo;
  behavior_info: IBehaviorInfo;
  risk_info: IRiskInfo;
  additional_info: IAdditionalInfo;
}

interface IStudent extends Document {
  email: string;
  first_name: string;
  last_name: string;
  prefix: string;
  role: string[];
  user_id: string;
  class_id: ObjectId | null| string;
  image_url?: string;
  phone: string;
  yearly_data: IYearlyData[];
}

export { IStudent, IYearlyData };