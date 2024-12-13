export interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    read_at: Date;
    read: boolean;
    created_at: Date
}
