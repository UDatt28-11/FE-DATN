

export interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
}

// src/types/review.ts

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
    id: string;
    bookingDetailsId?: string | null; // booking_details_id (mapped từ backend)
    userId: string; // tên / mã người dùng hiển thị trên UI
    propertyId: string; // tên / mã cơ sở lưu trú hiển thị trên UI
    roomId?: string | null; // tên / mã phòng (nếu cần)

    rating: number; // rating (1-5)
    title?: string | null; // title
    comment?: string | null; // comment
    photos?: string[]; // photos (giả định lưu dạng JSON array)

    isVerifiedPurchase: boolean; // is_verified_purchase
    isHelpfulCount: number; // is_helpful_count
    isNotHelpfulCount: number; // is_not_helpful_count

    status: ReviewStatus; // status: pending | approved | rejected
    adminNotes?: string | null; // admin_notes
    reviewedAt?: string | null; // reviewed_at (thời gian admin duyệt)

    createdAt: string; // created_at
    updatedAt: string; // updated_at
}

