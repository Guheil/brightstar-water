export interface CustomerProfileView {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  updatedAt: string;
}

export interface CustomerProfileUpdateResponse {
  profile: CustomerProfileView;
}
