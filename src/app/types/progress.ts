export interface UserProgressMap {
  [lessonId: string]: {
    percent: number;
    updatedAt?: string;
  };
}

export interface ProgressUpdatePayload {
  lessonId: string;
  percent: number;
  currentPercent?: number;
}
