/**
 * Utility functions để format tiền tệ Việt Nam
 */

/**
 * Format số tiền thành định dạng VNĐ chuẩn Việt Nam
 * Ví dụ: 1500000 -> "1.500.000 VNĐ"
 * 
 * @param amount - Số tiền cần format
 * @param showCurrency - Có hiển thị "VNĐ" hay không (mặc định: true)
 * @returns Chuỗi đã format
 */
export const formatVND = (amount: number | string, showCurrency: boolean = true): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
        return showCurrency ? '0 VNĐ' : '0';
    }
    
    // Làm tròn về số nguyên (không có số thập phân)
    const roundedAmount = Math.round(numAmount);
    
    // Format với dấu chấm ngăn cách hàng nghìn
    const formatted = roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return showCurrency ? `${formatted} VNĐ` : formatted;
};

/**
 * Format số tiền thành định dạng VNĐ với đơn vị
 * Ví dụ: 1500000 -> "1.500.000 VNĐ/đêm"
 * 
 * @param amount - Số tiền cần format
 * @param unit - Đơn vị (ví dụ: "/đêm", "/người")
 * @returns Chuỗi đã format
 */
export const formatVNDWithUnit = (amount: number | string, unit: string = ''): string => {
    const formatted = formatVND(amount, false);
    return unit ? `${formatted} VNĐ${unit}` : `${formatted} VNĐ`;
};

/**
 * Parse chuỗi tiền VNĐ về số
 * Ví dụ: "1.500.000 VNĐ" -> 1500000
 * 
 * @param vndString - Chuỗi tiền VNĐ
 * @returns Số tiền
 */
export const parseVND = (vndString: string): number => {
    if (!vndString) return 0;
    
    // Loại bỏ "VNĐ" và các ký tự không phải số, dấu chấm
    const cleaned = vndString.replace(/[^\d.]/g, '');
    
    // Loại bỏ dấu chấm (ngăn cách hàng nghìn)
    const withoutDots = cleaned.replace(/\./g, '');
    
    return parseFloat(withoutDots) || 0;
};

