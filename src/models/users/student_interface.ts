import { Document, ObjectId } from "mongoose";

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
  family_relation_status: number;
  parent_prefix: string;
  parent_name: string;
  parent_last_name: string;
  parent_phone: string;
  parent_job: string;
  lat: number;
  lng: number;
}

interface IRelationInfo {
  family_member: number;
  family_time: number;
  father_relation: string;
  mother_relation: string;
  brother_relation: string;
  sister_relation: string;
  grand_parent_relation: string;
  relatives_relation: string;
  other_relative: string;
  other_relation: string;
  when_student_alone: string;
  total_household_income: number;
  daily_total_to_school: number;
  received_daily_from: string;
  student_part_time: string;
  student_income: number;
  support_from_school: string;
  support_from_organize: string;
  parent_concern: string;
}

interface IFamilyStatusInfo {
  household_burdens: string[];
  housing_type: string;
  housing_condition: string;
  family_vehicles: string[];
  less_than_one: string;
  owned_land: number;
  rented_land: number;
}

interface IBehaviorAndRisk {
  health_risk: string[];
  welfare_and_safety: string[];
  distance_to_school: number;
  time_used: number;
  school_transport: string;
  student_resp: string[];
  student_resp_other: string;
  hobbies: string[];
  other_hobbies: string;
  drugs_behav: string[];
  violent_behav: string[];
  other_violent_behav: string;
  sexual_behav: string[];
  gaming_behav: string[];
  other_gaming_behav: string;
  computer_internet_access: string;
  tech_use_behav: string;
  information_giver: string;
}

interface IYearlyData {
  year: ObjectId | string;
  personal_info: IPersonalInfo;
  relation_info: IRelationInfo;
  family_status_info: IFamilyStatusInfo;
  behavior_and_risk: IBehaviorAndRisk;
}

interface IStudent extends Document {
  email: string;
  first_name: string;
  last_name: string;
  prefix: string;
  role: string[];
  user_id: string;
  class_id: ObjectId | string;
  image_url?: string;
  yearly_data: IYearlyData[];
}

export { IStudent, IYearlyData };