// User Configuration Constants (matching Laravel)

export const GENDER_OPTIONS = {
  MALE: 'Male',
  FEMALE: 'Female',
};

export const PROFILE_BY_OPTIONS = {
  SELF: 'Self',
  PARENTS: 'Parents',
  FRIENDS: 'Friends',
  GUARDIAN: 'Guardian',
  SIBLING: 'Sibling',
};

export const MARITAL_STATUS_OPTIONS = {
  UNMARRIED: 'Unmarried',
  WIDOW_WIDOWER: 'Widow/Widower',
  DIVORCEE: 'Divorcee',
  SEPARATED: 'Seperated',
  AWAITING_DIVORCE: 'Awaiting Divorce',
};

export const MOON_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const OCCUPATION_OPTIONS = [
  'Private Sector', 'Government/PSU', 'Defense/Civil Services',
  'Business/Self Employed', 'Not Working', 'Doctor', 'Engineer',
  'Teacher', 'Lawyer', 'Accountant', 'Architect', 'Consultant',
  'IT Professional', 'Manager', 'Artist', 'Scientist', 'Other'
];

export const EDUCATION_OPTIONS = [
  'High School', 'Intermediate', 'Diploma', 'B.A.', 'B.Arch', 'B.Com',
  'B.Ed', 'B.Sc', 'B.Tech/B.E.', 'BBA', 'BCA', 'BDS', 'BFA', 'BHM',
  'B.Pharma', 'BL/LLB', 'MBBS', 'M.A.', 'M.Arch', 'M.Com', 'M.Ed',
  'M.Sc', 'M.Tech', 'MBA/PGDM', 'MCA', 'MDS', 'MS/M.S.', 'M.Pharma',
  'LLM', 'MD/MS (Medical)', 'Ph.D', 'Other'
];

export const HEIGHT_OPTIONS = (() => {
  const heights = [];
  for (let feet = 4; feet <= 7; feet++) {
    for (let inch = 0; inch < 12; inch++) {
      if (feet === 7 && inch > 0) break;
      heights.push(`${feet}' ${inch}"`);
    }
  }
  heights.push('7\'+');
  return heights;
})();

export const DIET_OPTIONS = {
  VEGETARIAN: 'Vegetarian',
  EGGETARIAN: 'Eggetarian',
  NON_VEGETARIAN: 'Non-Vegetarian',
  VEGAN: 'Vegan',
};

export const ANNUAL_INCOME_OPTIONS = [
  'No income', 'Below 1 Lakh', '1-2 Lakhs', '2-3 Lakhs',
  '3-4 Lakhs', '4-5 Lakhs', '5-7 Lakhs', '7-10 Lakhs',
  '10-15 Lakhs', '15-20 Lakhs', '20-25 Lakhs', '25+ Lakhs'
];

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  CANCELLED: 'Cancelled',
  DELIVERED: 'Delivered',
  FEEDBACK: 'Feedback',
};

export const PACKAGE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPT: 'friend_accept',
  PROFILE_VIEW: 'profile_view',
  PHOTO_REQUEST: 'photo_request',
  PACKAGE_EXPIRE: 'package_expire',
  MESSAGE: 'message',
};
