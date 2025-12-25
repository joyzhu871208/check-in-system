
export interface Participant {
  name: string;
  phone?: string;
}

export interface CheckInRecord extends Participant {
  timestamp: string;
}

export interface WhitelistItem extends Participant {
  hasCheckedIn: boolean;
  checkInTime?: string;
}

export interface Winner extends CheckInRecord {
  prizeRank?: string;
}

export enum ViewMode {
  ADMIN = 'ADMIN',
  VISUALIZER = 'VISUALIZER',
  MOBILE_CHECKIN = 'MOBILE_CHECKIN'
}
