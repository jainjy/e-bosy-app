// src/interfaces/index.ts
export interface CoursePerformance {
    course_id: number;
    title: string;
    students: number;
    revenue: number;
    rating: number;
    status: 'Popular' | 'Trending' | 'Draft' | 'Launched' | 'In Progress';
    completion_percentage?: number;
    estimated_launch_date?: string;
  }
  
  export interface StudentDemographics {
    top_countries: { country: string; percentage: number }[];
    age_groups: { group: string; percentage: number }[];
  }
  
  export interface StudentExperienceLevel {
    beginner: number;
    intermediate: number;
    advanced: number;
  }
  
  export interface TeacherAnalyticsData {
    total_revenue: number;
    total_students: number;
    average_rating: number;
    completion_rate: number;
    revenue_overview: { month: string; revenue: number }[];
    course_performance: CoursePerformance[];
    student_demographics: StudentDemographics;
    student_experience_level: StudentExperienceLevel;
  }
  
  export interface TeacherAnalyticsResponse {
    success: boolean;
    message: string;
    data: TeacherAnalyticsData;
  }