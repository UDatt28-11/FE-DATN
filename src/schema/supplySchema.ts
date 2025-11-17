import { z } from "zod";

// Enum trạng thái
export const statusEnum = ["active", "inactive", "discontinued"] as const;

// Schema validate vật tư
export const SupplySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tên vật tư là bắt buộc" })
    .max(255, { message: "Tên vật tư quá dài" }),
  description: z
    .string()
    .max(1000, { message: "Mô tả quá dài" })
    .optional(),
  category: z
    .string()
    .min(1, { message: "Loại vật tư là bắt buộc" })
    .max(100, { message: "Loại vật tư quá dài" }),
  unit: z
    .string()
    .min(1, { message: "Đơn vị là bắt buộc" })
    .max(50, { message: "Đơn vị quá dài" }),
  current_stock: z
    .number({}) // chỉ cần {} hoặc để trống
    .int({ message: "Tồn kho phải là số nguyên" })
    .min(0, { message: "Tồn kho không thể âm" }),
  min_stock_level: z
    .number({})
    .int({ message: "Mức tồn tối thiểu phải là số nguyên" })
    .min(0, { message: "Mức tồn tối thiểu không thể âm" }),
  max_stock_level: z
    .number({})
    .int({ message: "Mức tồn tối đa phải là số nguyên" })
    .min(0, { message: "Mức tồn tối đa không thể âm" })
    .optional(),
  unit_price: z
    .number({})
    .min(0, { message: "Đơn giá không thể âm" }),
  supplier: z.string().max(255, { message: "Tên nhà cung cấp quá dài" }).optional(),
  supplier_contact: z
    .string()
    .max(255, { message: "Thông tin liên hệ quá dài" })
    .optional(),
  status: z.enum(statusEnum, { message: "Trạng thái không hợp lệ" }).optional(),
});

export type SupplySchemaType = z.infer<typeof SupplySchema>;
