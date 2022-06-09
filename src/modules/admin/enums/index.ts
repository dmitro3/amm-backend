export enum AdminUserType {
  Restricted = 0,
  Unrestricted = 1,
}

export enum AdminUserStatus {
  Locked = 0,
  Unlocked = 1,
}

export enum AdminUserStatusRegistration {
  Deactive = 0,
  Submit = 1,
  Pending = 2,
  Active = 3,
}

export const USER_STATUS = [AdminUserStatus.Locked, AdminUserStatus.Unlocked];
export const USER_TYPE = [AdminUserType.Restricted, AdminUserType.Unrestricted];
export const USER_STATUS_REGISTRATION = [AdminUserStatusRegistration.Deactive, AdminUserStatusRegistration.Active];
