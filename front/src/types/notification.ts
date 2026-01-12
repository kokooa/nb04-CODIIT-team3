export interface NotificationItem {
  id: string;
  userId: string;
  content: string;
  isChecked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  list: NotificationItem[];
  totalCount: number;
}