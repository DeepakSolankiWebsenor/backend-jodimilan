

import { Request } from 'express-serve-static-core';

export interface VerifyEmailOtpRequest extends Request {
  body: {
    email: string;
    otp: string;
  };
}

export interface ResendOtpRequest extends Request {
  body: {
    email: string;
  };
}



// User types matching Laravel enums
export enum UserGender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum ProfileBy {
  SELF = 'Self',
  PARENTS = 'Parents',
  FRIENDS = 'Friends',
  GUARDIAN = 'Guardian',
  SIBLING = 'Sibling',
}

export enum MaritalStatus {
  UNMARRIED = 'Unmarried',
  WIDOW_WIDOWER = 'Widow/Widower',
  DIVORCEE = 'Divorcee',
  SEPARATED = 'Seperated',
  AWAITING_DIVORCE = 'Awaiting Divorce',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
  NOT_VERIFIED = 'Not Verified',
}

export enum PaymentMethod {
  ONLINE = 'Online',
  COD = 'COD',
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  PENDING = 'Pending',
}

export enum OrderStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum PaymentGatewayType {
  RAZORPAY = 'Razorpay',
  CCAVENUE = 'CCAvenue',
  PAYPAL = 'Paypal',
}

export enum FriendRequestStatus {
  YES = 'Yes',
  NO = 'No',
}

// Custom request interface with authenticated user
export interface AuthRequest extends Request {
  user?: any;
  userId?: number;
}

// API Response structure
export interface ApiResponse<T = any> {
  code: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

// JWT Payload
export interface JwtPayload {
  userId: number;
  email: string;
  phone: string;
  ryt_id: string;
  iat?: number;
  exp?: number;
}

// Partner Preferences
export interface PartnerPreferences {
  enabled: boolean;
  marital_status?: string[];
  religion?: number[];
  caste?: number[];
  min_age?: number;
  max_age?: number;
}

// OTP Data
export interface OtpData {
  otp: string;
  expiry: Date;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Search Filters
export interface SearchFilters {
  gender?: string;
  mat_status?: string;
  religion?: number;
  caste?: number;
  min_age?: number;
  max_age?: number;
  occupation?: string;
  moon_sign?: string;
  height?: string;
  min_income?: string;
  max_income?: string;
  education?: string;
  city?: number;
}
