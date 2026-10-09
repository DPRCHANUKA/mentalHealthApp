export type ProfileFields = { name: string; id: string; sex: string };
export type ProfileErrors = Partial<Record<keyof ProfileFields, string>>;
export type ProfileRole = 'student' | 'mentor';

// Name: SURNAME then initials, e.g. CHNAUKA D.P.R or KARUNARATHNE D.P.G
const NAME_PATTERN = /^[A-Z]+ [A-Z](\.[A-Z])*\.?$/;

// Student ID: 2 capital letters + 8 digits, e.g. IT23728462, CS..., EN...
const STUDENT_ID_PATTERN = /^[A-Z]{2}\d{8}$/;

// Mentor ID: LI + digits, e.g. LI434343 (4 to 8 digits, change if needed)
const MENTOR_ID_PATTERN = /^LI\d{4,8}$/;

const SEX_VALUES = ['male', 'female', 'none'];

export function validateProfile(p: ProfileFields, role: ProfileRole): ProfileErrors {
  const errors: ProfileErrors = {};
  // Case does not matter when typing; it is converted to capitals when saved
  const name = p.name.trim().replace(/\s+/g, ' ').toUpperCase();
  const id = p.id.trim().toUpperCase();
  const sex = p.sex.trim().toLowerCase();

  if (!name) errors.name = 'Enter your name.';
  else if (!NAME_PATTERN.test(name)) errors.name = 'Use this format: SURNAME D.P.R (example: KARUNARATHNE D.P.G)';

  if (!id) errors.id = 'Enter your ID.';
  else if (role === 'student' && !STUDENT_ID_PATTERN.test(id)) {
    errors.id = 'Student ID must be 2 letters + 8 numbers (example: IT23728462).';
  } else if (role === 'mentor' && !MENTOR_ID_PATTERN.test(id)) {
    errors.id = 'Mentor ID must start with LI followed by numbers (example: LI434343).';
  }

  if (!sex) errors.sex = 'Select an option.';
  else if (!SEX_VALUES.includes(sex)) errors.sex = 'Gender must be Male, Female or None.';

  return errors;
}

export function isProfileValid(p: ProfileFields, role: ProfileRole) {
  return Object.keys(validateProfile(p, role)).length === 0;
}

export function normalizeProfile<T extends ProfileFields>(p: T): T {
  const sex = p.sex.trim().toLowerCase();
  return {
    ...p,
    name: p.name.trim().replace(/\s+/g, ' ').toUpperCase(),
    id: p.id.trim().toUpperCase(),
    sex: sex ? sex.charAt(0).toUpperCase() + sex.slice(1) : '',
  };
}


