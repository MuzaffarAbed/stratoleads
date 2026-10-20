export type BusinessCardInput = {
  firstName: string;
  surname: string;
  jobTitle: string;
  companyName: string;
  workEmail: string;
  mobilePhone: string;
  officePhone?: string;
  website?: string;
  linkedInUrl?: string;
  location?: string;
  profileImageUrl?: string;
  slug: string;
  isActive: boolean;
};

export type BusinessCard = BusinessCardInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicBusinessCard = {
  id: string;
  slug: string;
  firstName: string;
  surname: string;
  jobTitle: string;
  companyName: string;
  workEmail: string;
  mobilePhone: string;
  officePhone?: string;
  website?: string;
  linkedInUrl?: string;
  location?: string;
  profileImageUrl?: string;
};
