import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Select,
  Divider,
  Table,
  Typography,
  Spin,
  Alert,
  Tag,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import invoiceService from "../../../service/invoiceService";
import {
  listBookings,
  getBooking,
  type BookingOrder,
} from "../../../service/bookingService";
import supplyService from "../../../service/supplyService";
import type { CreateInvoiceData } from "../../../types/invoice/invoice";
import type { Supply } from "../../../types/supply/supplies";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface InvoiceItemForm {
  key: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  supply_id?: number; // ID của vật tư (nếu là vật tư)
  max_stock?: number; // Tồn kho tối đa (nếu là vật tư)
}

const AddInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(
    null
  );
  const [supplyModalVisible, setSupplyModalVisible] = useState(false);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [fetchingSupplies, setFetchingSupplies] = useState(false);
  const [selectedSupplies, setSelectedSupplies] = useState<number[]>([]);
  // Lưu số lượng cho từng vật tư: { supplyId: quantity }
  const [supplyQuantities, setSupplyQuantities] = useState<
    Record<number, number>
  >({});
  const [items, setItems] = useState<InvoiceItemForm[]>([
    {
      key: "1",
      item_type: "room_charge",
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 10,
    },
  ]);

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setFetchingBookings(true);
    try {
      const response = await listBookings({
        status: ["confirmed", "completed"],
        per_page: 100,
      });
      setBookings(response.data || []);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách booking:", error);
      toast.error("Không thể tải danh sách đặt phòng!");
    } finally {
      setFetchingBookings(false);
    }
  };

  // Handle booking selection
  const handleBookingSelect = async (bookingId: number | null) => {
    setSelectedBookingId(bookingId);
    if (!bookingId) {
      setSelectedBooking(null);
      // Reset form
      form.resetFields();
      setItems([
        {
          key: "1",
          item_type: "room_charge",
          description: "",
          quantity: 1,
          unit_price: 0,
          tax_rate: 10,
        },
      ]);
      return;
    }

    try {
      const booking = await getBooking(bookingId, "details,details.room");
      setSelectedBooking(booking);

      // Auto-fill customer information
      form.setFieldsValue({
        customer_name: booking.customer_name || "",
        customer_email: booking.customer_email || "",
        customer_phone: booking.customer_phone || "",
        payment_method: booking.payment_method || "cash",
        notes: booking.notes || "",
      });

      // Auto-fill invoice items from booking details
      if (booking.details && booking.details.length > 0) {
        const bookingItems: InvoiceItemForm[] = booking.details.map(
          (detail, index) => {
            const checkIn = dayjs(detail.check_in_date);
            const checkOut = dayjs(detail.check_out_date);
            const nights = Math.max(1, checkOut.diff(checkIn, "day"));
            const roomName =
              detail.room?.name ||
              detail.room_name ||
              `Phòng ${detail.room_id}`;

            // sub_total là tổng giá cho cả đợt đặt phòng (đã bao gồm số đêm)
            // Tính unit_price (giá mỗi đêm) = sub_total / nights
            // Giả định sub_total là giá chưa bao gồm thuế (giá gốc)
            const unitPrice =
              nights > 0 ? detail.sub_total / nights : detail.sub_total;

            return {
              key: `booking-${detail.id}-${index}`,
              item_type: "room_charge",
              description: `${roomName} - ${nights} đêm (${checkIn.format(
                "DD/MM/YYYY"
              )} - ${checkOut.format("DD/MM/YYYY")})`,
              quantity: nights,
              unit_price: Math.round(unitPrice * 100) / 100, // Làm tròn 2 chữ số thập phân
              tax_rate: 10,
            };
          }
        );

        setItems(bookingItems.length > 0 ? bookingItems : items);
      } else if (booking.total_amount > 0) {
        // If no details, use total amount as single item
        // Giả định total_amount là giá chưa bao gồm thuế (giá gốc)
        setItems([
          {
            key: "booking-total",
            item_type: "room_charge",
            description: `Đặt phòng - Mã: ${booking.code}`,
            quantity: 1,
            unit_price: booking.total_amount,
            tax_rate: 10,
          },
        ]);
      }
    } catch (error: any) {
      console.error("Lỗi khi tải thông tin booking:", error);
      toast.error("Không thể tải thông tin đặt phòng!");
    }
  };

  const handleAddService = () => {
    setItems([
      ...items,
      {
        key: Date.now().toString(),
        item_type: "service_charge",
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 10,
      },
    ]);
  };

  const handleCheckSupplies = async () => {
    // Kiểm tra xem đã chọn booking chưa
    if (
      !selectedBooking ||
      !selectedBooking.details ||
      selectedBooking.details.length === 0
    ) {
      toast.warning("Vui lòng chọn đặt phòng trước khi kiểm tra vật tư!");
      return;
    }

    // Lấy danh sách room_id từ booking details
    const roomIds = selectedBooking.details
      .map((detail: any) => detail.room_id)
      .filter(Boolean);

    if (roomIds.length === 0) {
      toast.warning("Không tìm thấy thông tin phòng trong đặt phòng!");
      return;
    }

    setSupplyModalVisible(true);
    setFetchingSupplies(true);
    setSelectedSupplies([]);
    setSupplyQuantities({}); // Reset số lượng khi mở modal

    try {
      // Lấy vật tư cho tất cả các phòng (nếu có nhiều phòng)
      const allSupplies: Supply[] = [];

      for (const roomId of roomIds) {
        try {
          console.log(`Đang lấy vật tư cho phòng ${roomId}...`);
          const roomSupplies = await supplyService.getByRoom(roomId);
          console.log(
            `Tìm thấy ${roomSupplies.length} vật tư cho phòng ${roomId}:`,
            roomSupplies
          );

          if (roomSupplies && roomSupplies.length > 0) {
            allSupplies.push(...roomSupplies);
          }
        } catch (error: any) {
          console.error(`Lỗi khi lấy vật tư cho phòng ${roomId}:`, error);
          // Tiếp tục với phòng khác nếu có lỗi
        }
      }

      console.log(
        `Tổng cộng tìm thấy ${allSupplies.length} vật tư từ ${roomIds.length} phòng`
      );

      // Nếu không tìm thấy vật tư theo phòng cụ thể, thử lấy tất cả rồi filter
      if (allSupplies.length === 0) {
        console.log(
          "Không tìm thấy vật tư qua API filter, đang lấy tất cả để filter lại..."
        );
        try {
          // Lấy tất cả vật tư không có filter room_id
          const allSuppliesData: any = await supplyService.getAll();
          console.log("Tất cả vật tư từ hệ thống:", allSuppliesData);

          // Xử lý response có thể là paginated
          let suppliesList: Supply[] = [];
          if (Array.isArray(allSuppliesData)) {
            suppliesList = allSuppliesData;
          } else if (
            allSuppliesData?.data &&
            Array.isArray(allSuppliesData.data)
          ) {
            suppliesList = allSuppliesData.data;
          } else if (
            allSuppliesData?.data?.data &&
            Array.isArray(allSuppliesData.data.data)
          ) {
            suppliesList = allSuppliesData.data.data;
          }

          console.log(
            `Đã parse được ${suppliesList.length} vật tư từ response`
          );

          // Lọc CHỈ lấy vật tư thuộc các phòng đã chọn
          const filteredSupplies = suppliesList.filter((supply: any) => {
            // Chỉ lấy vật tư có room_id khớp với các phòng trong booking
            const match = roomIds.includes(Number(supply.room_id));
            if (!match && supply.room_id) {
              console.log(
                `⚠️ Vật tư "${supply.name}" (ID: ${supply.id}) có room_id=${
                  supply.room_id
                } không thuộc phòng [${roomIds.join(", ")}]`
              );
            }
            return match;
          });

          console.log(
            `✅ Sau khi filter: ${
              filteredSupplies.length
            } vật tư thuộc phòng [${roomIds.join(", ")}]`
          );

          if (filteredSupplies.length > 0) {
            // Loại bỏ trùng lặp (nếu có)
            const uniqueSupplies = filteredSupplies.filter(
              (supply, index, self) =>
                index === self.findIndex((s) => s.id === supply.id)
            );
            setSupplies(uniqueSupplies);
            toast.success(
              `✅ Tìm thấy ${uniqueSupplies.length} vật tư trong ${
                roomIds.length > 1 ? "các phòng" : "phòng"
              } đã chọn!`
            );
          } else {
            // Không có vật tư cho phòng này
            setSupplies([]);
            toast.warning(
              `⚠️ Không tìm thấy vật tư nào cho phòng ${roomIds.join(
                ", "
              )}. Phòng này chưa được cấu hình vật tư.`
            );
          }
        } catch (error: any) {
          console.error("❌ Lỗi khi lấy danh sách vật tư:", error);
          setSupplies([]);
          toast.error(
            `❌ Không thể lấy danh sách vật tư: ${
              error.message || "Lỗi không xác định"
            }`
          );
        }
      } else {
        // Loại bỏ trùng lặp
        const uniqueSupplies = allSupplies.filter(
          (supply, index, self) =>
            index === self.findIndex((s) => s.id === supply.id)
        );
        console.log(
          `Sau khi loại bỏ trùng lặp: ${uniqueSupplies.length} vật tư`
        );
        setSupplies(uniqueSupplies);
        toast.success(
          `Tìm thấy ${uniqueSupplies.length} vật tư cho phòng đã chọn!`
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách vật tư:", error);
      toast.error(
        `Không thể lấy danh sách vật tư: ${
          error.message || "Lỗi không xác định"
        }`
      );
      setSupplies([]);
    } finally {
      setFetchingSupplies(false);
    }
  };

  const handleSupplyQuantityChange = (supplyId: number, quantity: number) => {
    setSupplyQuantities((prev) => ({
      ...prev,
      [supplyId]: quantity,
    }));
  };

  const handleAddSelectedSupplies = async () => {
    if (selectedSupplies.length === 0) {
      toast.warning("⚠️ Vui lòng chọn ít nhất một vật tư!");
      return;
    }

    // Kiểm tra và chuẩn bị danh sách vật tư để thêm
    const itemsToAdd: Array<{ supply: Supply; quantity: number }> = [];

    for (const supplyId of selectedSupplies) {
      const supply = supplies.find((s) => s.id === supplyId);
      if (!supply) {
        console.warn(`⚠️ Không tìm thấy vật tư với ID: ${supplyId}`);
        continue;
      }

      // Lấy số lượng từ state (mặc định 1 nếu chưa set)
      const quantity = supplyQuantities[supplyId] || 1;

      // Kiểm tra số lượng hợp lệ
      if (quantity <= 0) {
        toast.warning(`⚠️ Số lượng vật tư "${supply.name}" phải lớn hơn 0!`);
        continue;
      }

      if (quantity > supply.current_stock) {
        toast.warning(
          `⚠️ Số lượng vật tư "${supply.name}" không được vượt quá tồn kho (${supply.current_stock})!`
        );
        continue;
      }

      itemsToAdd.push({ supply, quantity });
    }

    if (itemsToAdd.length === 0) {
      toast.error("❌ Không có vật tư hợp lệ để thêm vào hóa đơn!");
      return;
    }

    // Thêm các vật tư vào hóa đơn
    const newItems: InvoiceItemForm[] = itemsToAdd.map(
      ({ supply, quantity }) => {
        const unitPrice = Number(supply.unit_price || 0);

        console.log(
          `➕ Thêm vật tư "${supply.name}": ${quantity} ${
            supply.unit || "cái"
          } x ${unitPrice.toLocaleString("vi-VN")} ₫`
        );

        return {
          key: `supply-${supply.id}-${Date.now()}`,
          item_type: "supply_charge", // Phí vật tư
          description: `${supply.name}${
            supply.unit ? ` (${supply.unit})` : ""
          }${supply.category ? ` - ${supply.category}` : ""}`,
          quantity: quantity, // Sử dụng số lượng đã chọn
          unit_price: unitPrice,
          tax_rate: 0, // Thuế mặc định 0% cho vật tư
          supply_id: supply.id, // Lưu ID vật tư để theo dõi
          max_stock: supply.current_stock, // Lưu tồn kho hiện tại
        };
      }
    );

    // Cập nhật tồn kho (trừ đi số lượng đã dùng)
    // TODO: Có thể gọi API để trừ tồn kho trong database nếu cần
    setSupplies((prevSupplies) =>
      prevSupplies.map((supply) => {
        const usedQuantity = supplyQuantities[supply.id] || 0;
        if (usedQuantity > 0 && selectedSupplies.includes(supply.id)) {
          return {
            ...supply,
            current_stock: Math.max(0, supply.current_stock - usedQuantity),
          };
        }
        return supply;
      })
    );

    // Tính tổng tiền của các vật tư vừa thêm
    const totalAmount = newItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unit_price;
      const tax = (subtotal * item.tax_rate) / 100;
      return sum + subtotal + tax;
    }, 0);

    setItems([...items, ...newItems]);
    setSupplyModalVisible(false);
    setSelectedSupplies([]);
    setSupplyQuantities({}); // Reset số lượng

    const totalQuantity = itemsToAdd.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    toast.success(
      `✅ Đã thêm ${newItems.length} loại vật tư (tổng ${totalQuantity} ${
        itemsToAdd[0]?.supply.unit || "cái"
      }) vào hóa đơn! Tổng tiền: ${totalAmount.toLocaleString("vi-VN")} ₫`
    );
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateItemTotal = (item: InvoiceItemForm) => {
    // Tính tổng phụ (chưa bao gồm thuế)
    const subtotal = item.quantity * item.unit_price;
    // Tính thuế = tổng phụ * (thuế % / 100)
    const tax = Math.round((subtotal * item.tax_rate) / 100);
    // Tổng cộng = tổng phụ + thuế
    return Math.round(subtotal + tax);
  };

  const calculateTotals = () => {
    // Tính tổng phụ (chưa bao gồm thuế) cho tất cả items
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price;
    }, 0);

    // Tính tổng thuế cho tất cả items
    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemTax = (itemSubtotal * item.tax_rate) / 100;
      return sum + itemTax;
    }, 0);

    // Tổng cộng = tổng phụ + tổng thuế
    const total = subtotal + taxAmount;

    // Làm tròn để tránh lỗi số thập phân
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      toast.error("Vui lòng thêm ít nhất một mục hóa đơn!");
      return;
    }

    setLoading(true);
    try {
      // If booking is selected, use createFromBooking API
      if (selectedBookingId) {
        const response: any = await invoiceService.createFromBooking(
          selectedBookingId
        );
        toast.success("Tạo hóa đơn từ đặt phòng thành công!");
        const newInvoiceId =
          response?.id || response?.data?.id || response?.data?.data?.id;
        if (newInvoiceId) {
          navigate(`/admin/invoice/view/${newInvoiceId}`);
        } else {
          navigate("/admin/invoice");
        }
        return;
      }

      // Otherwise, create invoice manually
      const invoiceData: CreateInvoiceData = {
        property_id: 1, // TODO: Get from context or form
        booking_order_id: selectedBookingId || undefined,
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        customer_address: values.customer_address,
        issue_date: values.issue_date.format("YYYY-MM-DD"),
        due_date: values.due_date.format("YYYY-MM-DD"),
        payment_method: values.payment_method,
        notes: values.notes,
        terms_conditions: values.terms_conditions,
        items: items.map((item) => ({
          item_type: item.item_type,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
        })),
      };

      const response: any = await invoiceService.create(invoiceData);
      toast.success("Tạo hóa đơn thành công!");
      // Tự động chuyển đến trang xem chi tiết hóa đơn vừa tạo
      const newInvoiceId =
        response?.id || response?.data?.id || response?.data?.data?.id;
      if (newInvoiceId) {
        navigate(`/admin/invoice/view/${newInvoiceId}`);
      } else {
        navigate("/admin/invoice");
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo hóa đơn:", error);
      toast.error(error.response?.data?.message || "Không thể tạo hóa đơn!");
    } finally {
      setLoading(false);
    }
  };

  const itemColumns: ColumnsType<InvoiceItemForm> = [
    {
      title: "Loại",
      dataIndex: "item_type",
      width: 150,
      render: (value: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          room_charge: { color: "blue", text: "Phí phòng" },
          service_charge: { color: "cyan", text: "Phí dịch vụ" },
          supply_charge: { color: "orange", text: "Phí vật tư" },
          penalty: { color: "red", text: "Phạt" },
          other: { color: "default", text: "Khác" },
        };
        const conf = typeMap[value] || typeMap.room_charge;
        return <Tag color={conf.color}>{conf.text}</Tag>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (value) => <Text>{value || "-"}</Text>,
    },
    {
      title: "SL",
      dataIndex: "quantity",
      width: 120,
      align: "center",
      render: (value: number, record: InvoiceItemForm) => {
        // Chỉ cho phép chỉnh sửa số lượng cho vật tư (supply_charge)
        if (
          record.item_type === "supply_charge" &&
          record.max_stock !== undefined &&
          record.supply_id
        ) {
          // Tồn kho ban đầu khi thêm vật tư vào hóa đơn (tồn kho trong phòng)
          const initialStock = record.max_stock || 0;

          // Số lượng hiện tại của item này
          const currentQuantity = record.quantity || 0;

          // Tính tổng số lượng đã dùng bởi TẤT CẢ các item có cùng supply_id (bao gồm cả item hiện tại)
          const totalUsedByAllItems = items
            .filter((item) => item.supply_id === record.supply_id)
            .reduce((sum, item) => sum + (item.quantity || 0), 0);

          // Tính tổng số lượng đã dùng bởi các item khác (KHÔNG tính item hiện tại)
          const usedByOtherItems = totalUsedByAllItems - currentQuantity;

          // Tồn kho còn lại = tồn kho ban đầu - số lượng đã dùng bởi các item khác
          const remainingStock = initialStock - usedByOtherItems;

          // Số lượng tối đa có thể dùng = tồn kho còn lại (KHÔNG được vượt quá)
          let actualMaxQuantity = Math.max(0, remainingStock);

          // Nếu đang mở modal supplies, lấy tồn kho hiện tại từ đó để tính chính xác hơn
          if (supplyModalVisible && record.supply_id) {
            const supplyInModal = supplies.find(
              (s) => s.id === record.supply_id
            );
            if (supplyInModal) {
              // Tồn kho hiện tại trong modal + số lượng hiện tại của item này
              // Nhưng vẫn không được vượt quá tồn kho ban đầu
              const modalMaxQuantity =
                supplyInModal.current_stock + currentQuantity;
              actualMaxQuantity = Math.min(remainingStock, modalMaxQuantity);
            }
          }

          // Hàm validate và xử lý thay đổi số lượng
          const handleQuantityChange = (newValue: number | null) => {
            const quantity = newValue || 1;

            // Tính lại tồn kho còn lại để kiểm tra chính xác (tính lại từ đầu)
            const initialStock = record.max_stock || 0;
            const currentQuantity = record.quantity || 0;

            // Tính tổng số lượng đã dùng bởi các item khác (KHÔNG tính item hiện tại)
            const usedByOtherItems = items
              .filter(
                (item) =>
                  item.supply_id === record.supply_id && item.key !== record.key
              )
              .reduce((sum, item) => sum + (item.quantity || 0), 0);

            // Tồn kho còn lại = tồn kho ban đầu - số lượng đã dùng bởi các item khác
            const remainingStock = initialStock - usedByOtherItems;

            // Số lượng tối đa = tồn kho còn lại (KHÔNG được vượt quá)
            const finalMaxQuantity = Math.max(0, remainingStock);

            // Validation: Không cho phép nhập số lượng vượt quá tồn kho
            if (quantity > finalMaxQuantity) {
              toast.error(
                `❌ Không thể vượt quá tồn kho! Tồn kho còn lại trong phòng: ${remainingStock}, Số lượng tối đa: ${finalMaxQuantity}`
              );
              // Tự động đặt về số lượng tối đa cho phép
              handleItemChange(record.key, "quantity", finalMaxQuantity);
              return finalMaxQuantity;
            }

            if (quantity < 1) {
              toast.warning("⚠️ Số lượng phải lớn hơn 0!");
              handleItemChange(record.key, "quantity", 1);
              return 1;
            }

            // Cập nhật số lượng
            const oldQuantity = currentQuantity;
            handleItemChange(record.key, "quantity", quantity);

            // Thông báo khi thay đổi số lượng thành công
            if (quantity !== oldQuantity) {
              const newRemainingStock = remainingStock - quantity;
              const difference = quantity - oldQuantity;
              const itemName = record.description.split(" ")[0];

              if (difference > 0) {
                toast.success(
                  `✅ Đã tăng số lượng "${itemName}" từ ${oldQuantity} lên ${quantity}. Tồn kho còn lại: ${newRemainingStock}`
                );
              } else if (difference < 0) {
                toast.info(
                  `ℹ️ Đã giảm số lượng "${itemName}" từ ${oldQuantity} xuống ${quantity}. Tồn kho còn lại: ${newRemainingStock}`
                );
              }
            }

            // Cập nhật tồn kho trong modal supplies nếu đang mở
            if (supplyModalVisible && record.supply_id) {
              setSupplies((prevSupplies) =>
                prevSupplies.map((supply) => {
                  if (supply.id === record.supply_id) {
                    // Tính lại tồn kho: tồn kho hiện tại + (số lượng cũ - số lượng mới)
                    const difference = oldQuantity - quantity;
                    const newStock = Math.max(
                      0,
                      supply.current_stock + difference
                    );
                    return {
                      ...supply,
                      current_stock: newStock,
                    };
                  }
                  return supply;
                })
              );
            }

            return quantity;
          };

          return (
            <InputNumber
              min={1}
              max={actualMaxQuantity}
              value={value || 1}
              onChange={handleQuantityChange}
              onPressEnter={(e) => {
                const target = e.target as HTMLInputElement;
                const enteredValue = parseInt(target.value) || 1;
                const validatedValue = handleQuantityChange(enteredValue);
                // Đảm bảo giá trị trong input được cập nhật đúng
                if (validatedValue !== enteredValue) {
                  target.value = validatedValue.toString();
                }
              }}
              parser={(displayValue) => {
                // Chỉ cho phép số nguyên dương
                if (!displayValue) return 1;
                const parsed = parseInt(displayValue.replace(/\D/g, "")) || 1;
                // Giới hạn không vượt quá max
                return Math.min(Math.max(1, parsed), actualMaxQuantity);
              }}
              formatter={(value) => {
                // Đảm bảo hiển thị số hợp lệ
                if (!value) return "1";
                const numValue =
                  typeof value === "number" ? value : parseInt(value);
                return Math.min(
                  Math.max(1, numValue),
                  actualMaxQuantity
                ).toString();
              }}
              style={{
                width: 80,
                fontSize: 13,
              }}
              controls={true}
              size="small"
              step={1}
              disabled={actualMaxQuantity === 0}
            />
          );
        }

        // Các loại khác (phí phòng, phí dịch vụ) chỉ hiển thị text
        return <Text>{value || 0}</Text>;
      },
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      width: 130,
      align: "right",
      render: (value) => <Text>{(value || 0).toLocaleString("vi-VN")}₫</Text>,
    },
    {
      title: "Thuế (%)",
      dataIndex: "tax_rate",
      width: 80,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) => handleItemChange(record.key, "tax_rate", val || 0)}
          min={0}
          max={100}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Tổng",
      key: "total",
      width: 120,
      align: "right",
      render: (_, record) => (
        <Text strong>
          {calculateItemTotal(record).toLocaleString("vi-VN")}₫
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  const totals = calculateTotals();

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/invoice")}
        >
          Quay lại
        </Button>
      </Space>

      <Card title={<Title level={3}>Tạo hóa đơn mới</Title>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            {/* Select Booking Order */}
            <Col span={24}>
              <Divider orientation="left" style={{ marginTop: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  🔍 Chọn đặt phòng (tùy chọn)
                </Text>
              </Divider>
              <Form.Item
                label={
                  <Text strong style={{ fontSize: 14 }}>
                    Chọn đặt phòng để tạo hóa đơn
                  </Text>
                }
                help={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chọn một đặt phòng để tự động điền thông tin khách hàng và
                    chi tiết hóa đơn
                  </Text>
                }
              >
                <Select
                  placeholder="Chọn đặt phòng..."
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={fetchingBookings}
                  value={selectedBookingId}
                  onChange={handleBookingSelect}
                  style={{ width: "100%" }}
                  size="large"
                  filterOption={(input, option: any) => {
                    const label = option?.label || "";
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  notFoundContent={
                    fetchingBookings ? (
                      <Spin size="small" />
                    ) : (
                      "Không tìm thấy đặt phòng"
                    )
                  }
                  optionLabelProp="label"
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                >
                  {bookings.map((booking) => {
                    const displayLabel = `${
                      booking.code || `#${booking.id}`
                    } - ${booking.customer_name || "N/A"}`;
                    const shortLabel =
                      displayLabel.length > 50
                        ? displayLabel.substring(0, 50) + "..."
                        : displayLabel;
                    return (
                      <Select.Option
                        key={booking.id}
                        value={booking.id}
                        label={shortLabel}
                      >
                        <div style={{ padding: "4px 0", minHeight: 50 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              marginBottom: 4,
                              fontSize: 14,
                            }}
                          >
                            {booking.code || `#${booking.id}`} -{" "}
                            {booking.customer_name || "N/A"}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#888",
                              lineHeight: 1.5,
                            }}
                          >
                            {booking.customer_phone &&
                              `${booking.customer_phone} | `}
                            Tổng:{" "}
                            {(booking.total_amount || 0).toLocaleString(
                              "vi-VN"
                            )}
                            ₫{booking.status && ` | ${booking.status}`}
                          </div>
                        </div>
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              {selectedBooking && (
                <Card
                  style={{
                    marginBottom: 24,
                    background:
                      "linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)",
                    border: "1px solid #91caff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(24, 144, 255, 0.1)",
                  }}
                  title={
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Space>
                        <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                          📋 Thông tin đặt phòng đã chọn
                        </Text>
                        <Tag
                          color={
                            selectedBooking.status === "confirmed"
                              ? "green"
                              : selectedBooking.status === "completed"
                              ? "blue"
                              : selectedBooking.status === "cancelled"
                              ? "red"
                              : "orange"
                          }
                        >
                          {selectedBooking.status === "confirmed"
                            ? "Đã xác nhận"
                            : selectedBooking.status === "completed"
                            ? "Hoàn thành"
                            : selectedBooking.status === "cancelled"
                            ? "Đã hủy"
                            : "Đang chờ"}
                        </Tag>
                      </Space>
                      <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={() => handleBookingSelect(null)}
                      >
                        Bỏ chọn
                      </Button>
                    </Space>
                  }
                >
                  <Row gutter={[24, 16]}>
                    <Col span={24}>
                      <Space size="large" wrap>
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Mã đặt phòng
                          </Text>
                          <Text strong style={{ fontSize: 16 }}>
                            {selectedBooking.code || `#${selectedBooking.id}`}
                          </Text>
                        </div>
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Tổng tiền
                          </Text>
                          <Text
                            strong
                            style={{ color: "#1890ff", fontSize: 18 }}
                          >
                            {(selectedBooking.total_amount || 0).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </Text>
                        </div>
                        {selectedBooking.checkin_date &&
                          selectedBooking.checkout_date && (
                            <div>
                              <Text
                                type="secondary"
                                style={{ fontSize: 12, display: "block" }}
                              >
                                Thời gian lưu trú
                              </Text>
                              <Text>
                                {dayjs(selectedBooking.checkin_date).format(
                                  "DD/MM/YYYY"
                                )}{" "}
                                -{" "}
                                {dayjs(selectedBooking.checkout_date).format(
                                  "DD/MM/YYYY"
                                )}
                              </Text>
                            </div>
                          )}
                      </Space>
                    </Col>

                    <Col span={24}>
                      <Divider style={{ margin: "12px 0" }} />
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          display: "block",
                          marginBottom: 12,
                        }}
                      >
                        👤 Thông tin khách hàng
                      </Text>
                      <Row gutter={[16, 12]}>
                        <Col span={8}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Tên khách hàng
                          </Text>
                          <Text>{selectedBooking.customer_name || "N/A"}</Text>
                        </Col>
                        <Col span={8}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Điện thoại
                          </Text>
                          <Text>{selectedBooking.customer_phone || "N/A"}</Text>
                        </Col>
                        <Col span={8}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            Email
                          </Text>
                          <Text>{selectedBooking.customer_email || "N/A"}</Text>
                        </Col>
                        {selectedBooking.payment_method && (
                          <Col span={8}>
                            <Text
                              type="secondary"
                              style={{ fontSize: 12, display: "block" }}
                            >
                              Phương thức thanh toán
                            </Text>
                            <Text>
                              {selectedBooking.payment_method === "cash"
                                ? "Tiền mặt"
                                : selectedBooking.payment_method ===
                                  "bank_transfer"
                                ? "Chuyển khoản"
                                : selectedBooking.payment_method ===
                                  "credit_card"
                                ? "Thẻ tín dụng"
                                : selectedBooking.payment_method === "e_wallet"
                                ? "Ví điện tử"
                                : selectedBooking.payment_method}
                            </Text>
                          </Col>
                        )}
                      </Row>
                    </Col>

                    {selectedBooking.details &&
                      selectedBooking.details.length > 0 && (
                        <Col span={24}>
                          <Divider style={{ margin: "12px 0" }} />
                          <Text
                            strong
                            style={{
                              fontSize: 14,
                              display: "block",
                              marginBottom: 12,
                            }}
                          >
                            🏠 Chi tiết phòng ({selectedBooking.details.length})
                          </Text>
                          <Row gutter={[12, 12]}>
                            {selectedBooking.details.map((detail, index) => {
                              const checkIn = dayjs(detail.check_in_date);
                              const checkOut = dayjs(detail.check_out_date);
                              const nights = Math.max(
                                1,
                                checkOut.diff(checkIn, "day")
                              );

                              return (
                                <Col span={24} key={detail.id || index}>
                                  <Card
                                    size="small"
                                    style={{
                                      background: "#fff",
                                      border: "1px solid #d9d9d9",
                                      borderRadius: 6,
                                    }}
                                  >
                                    <Row gutter={16} align="middle">
                                      <Col flex="auto">
                                        <Space
                                          direction="vertical"
                                          size={6}
                                          style={{ width: "100%" }}
                                        >
                                          <div>
                                            <Text
                                              strong
                                              style={{ fontSize: 15 }}
                                            >
                                              {detail.room?.name ||
                                                detail.room_name ||
                                                `Phòng ${detail.room_id}`}
                                            </Text>
                                          </div>
                                          <Space size="middle" wrap>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 12 }}
                                            >
                                              📅 {checkIn.format("DD/MM/YYYY")}{" "}
                                              → {checkOut.format("DD/MM/YYYY")}
                                            </Text>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 12 }}
                                            >
                                              🌙 {nights} đêm
                                            </Text>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 12 }}
                                            >
                                              👥 {detail.num_adults} người lớn
                                              {detail.num_children > 0 &&
                                                `, ${detail.num_children} trẻ em`}
                                            </Text>
                                          </Space>
                                        </Space>
                                      </Col>
                                      <Col>
                                        <div style={{ textAlign: "right" }}>
                                          <Text
                                            strong
                                            style={{
                                              color: "#1890ff",
                                              fontSize: 16,
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {Number(
                                              detail.sub_total || 0
                                            ).toLocaleString("vi-VN")}{" "}
                                            ₫
                                          </Text>
                                        </div>
                                      </Col>
                                    </Row>
                                  </Card>
                                </Col>
                              );
                            })}
                          </Row>
                        </Col>
                      )}

                    {selectedBooking.notes && (
                      <Col span={24}>
                        <Divider style={{ margin: "12px 0" }} />
                        <Text
                          strong
                          style={{
                            fontSize: 14,
                            display: "block",
                            marginBottom: 8,
                          }}
                        >
                          📝 Ghi chú
                        </Text>
                        <Text style={{ color: "#595959" }}>
                          {selectedBooking.notes}
                        </Text>
                      </Col>
                    )}
                  </Row>
                </Card>
              )}
            </Col>

            {/* Customer Information */}
            <Col span={24}>
              <Divider orientation="left" style={{ marginTop: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  👤 Thông tin khách hàng
                </Text>
              </Divider>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_name"
                label="Tên khách hàng"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_email"
                label="Email"
                rules={[{ type: "email" }]}
              >
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customer_phone" label="Điện thoại">
                <Input placeholder="0123456789" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customer_address" label="Địa chỉ">
                <Input placeholder="Địa chỉ khách hàng" />
              </Form.Item>
            </Col>

            {/* Invoice Details */}
            <Col span={24}>
              <Divider orientation="left" style={{ marginTop: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  📄 Thông tin hóa đơn
                </Text>
              </Divider>
            </Col>
            <Col span={8}>
              <Form.Item
                name="issue_date"
                label="Ngày tạo"
                initialValue={dayjs()}
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="due_date"
                label="Hạn thanh toán"
                initialValue={dayjs().add(7, "day")}
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="payment_method" label="Phương thức thanh toán">
                <Select placeholder="Chọn phương thức">
                  <Option value="cash">Tiền mặt</Option>
                  <Option value="bank_transfer">Chuyển khoản</Option>
                  <Option value="credit_card">Thẻ tín dụng</Option>
                  <Option value="e_wallet">Ví điện tử</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Invoice Items */}
            <Col span={24}>
              <Divider orientation="left" style={{ marginTop: 8 }}>
                <Text strong style={{ fontSize: 16 }}>
                  💰 Chi tiết hóa đơn
                </Text>
              </Divider>
              <Table
                columns={itemColumns}
                dataSource={items}
                pagination={false}
                size="small"
                style={{ marginBottom: 16, marginTop: 16 }}
                bordered
              />
              <Space
                direction="vertical"
                style={{ width: "100%", marginTop: 8 }}
                size="middle"
              >
                <Button
                  type="dashed"
                  onClick={handleAddService}
                  icon={<ShoppingOutlined />}
                  block
                >
                  Thêm phí dịch vụ
                </Button>
                <Button
                  type="default"
                  onClick={handleCheckSupplies}
                  icon={<CheckCircleOutlined />}
                  block
                >
                  Kiểm tra vật tư
                </Button>
              </Space>
            </Col>

            {/* Summary */}
            <Col span={24}>
              <Row justify="end" style={{ marginTop: 24 }}>
                <Col span={8}>
                  <Card
                    size="small"
                    style={{
                      background:
                        "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
                      border: "1px solid #d9d9d9",
                      borderRadius: 8,
                    }}
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="middle"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary">Tổng phụ:</Text>
                        <Text strong>
                          {totals.subtotal.toLocaleString("vi-VN")}₫
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary">Thuế:</Text>
                        <Text strong>
                          {totals.taxAmount.toLocaleString("vi-VN")}₫
                        </Text>
                      </div>
                      <Divider style={{ margin: "4px 0" }} />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: 8,
                          borderTop: "2px solid #1890ff",
                        }}
                      >
                        <Text strong style={{ fontSize: 16 }}>
                          Tổng cộng:
                        </Text>
                        <Text strong style={{ fontSize: 20, color: "#1890ff" }}>
                          {totals.total.toLocaleString("vi-VN")}₫
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* Notes & Terms */}
            <Col span={12}>
              <Form.Item name="notes" label="Ghi chú">
                <TextArea rows={3} placeholder="Ghi chú thêm..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="terms_conditions" label="Điều khoản">
                <TextArea rows={3} placeholder="Điều khoản và điều kiện..." />
              </Form.Item>
            </Col>

            {/* Submit */}
            <Col span={24}>
              <Divider />
              <Space>
                <Button onClick={() => navigate("/admin/invoice")}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Tạo hóa đơn
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Modal kiểm tra vật tư */}
      <Modal
        title="Kiểm tra vật tư"
        open={supplyModalVisible}
        onCancel={() => {
          setSupplyModalVisible(false);
          setSelectedSupplies([]);
        }}
        width={800}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setSupplyModalVisible(false);
              setSelectedSupplies([]);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={handleAddSelectedSupplies}
            disabled={selectedSupplies.length === 0}
          >
            Thêm vào hóa đơn ({selectedSupplies.length}) - Tổng SL:{" "}
            {selectedSupplies.reduce((sum, supplyId) => {
              const quantity = supplyQuantities[supplyId] || 1;
              return sum + quantity;
            }, 0)}
          </Button>,
        ]}
      >
        <Spin spinning={fetchingSupplies}>
          {!fetchingSupplies && supplies.length === 0 ? (
            <Alert
              message="Không tìm thấy vật tư"
              description="Không có vật tư nào trong phòng đã chọn hoặc chưa có vật tư trong hệ thống."
              type="info"
              showIcon
            />
          ) : supplies.length > 0 ? (
            <Table
              rowSelection={{
                type: "checkbox",
                selectedRowKeys: selectedSupplies,
                onChange: (selectedRowKeys) => {
                  setSelectedSupplies(selectedRowKeys as number[]);
                },
              }}
              columns={[
                {
                  title: "Tên vật tư",
                  dataIndex: "name",
                  key: "name",
                  width: 180,
                },
                {
                  title: "Phòng",
                  dataIndex: "room_id",
                  key: "room_id",
                  width: 100,
                  render: (roomId: number) => {
                    // Tìm tên phòng từ booking details
                    const bookingDetail = selectedBooking?.details?.find(
                      (d: any) => d.room_id === roomId
                    );
                    const roomName =
                      bookingDetail?.room?.name ||
                      bookingDetail?.room_name ||
                      `Phòng ${roomId}`;
                    return (
                      <Tag color="blue" title={`ID: ${roomId}`}>
                        {roomName.length > 15
                          ? roomName.substring(0, 15) + "..."
                          : roomName}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Danh mục",
                  dataIndex: "category",
                  key: "category",
                  width: 150,
                },
                {
                  title: "Đơn vị",
                  dataIndex: "unit",
                  key: "unit",
                  width: 80,
                },
                {
                  title: "Tồn kho",
                  dataIndex: "current_stock",
                  key: "current_stock",
                  width: 100,
                  render: (stock: number) => (
                    <Tag color={stock > 0 ? "green" : "red"}>{stock}</Tag>
                  ),
                  align: "center",
                },
                {
                  title: "Số lượng",
                  key: "quantity",
                  width: 160,
                  render: (_: any, record: Supply) => {
                    const maxQuantity = record.current_stock || 0;
                    const currentQuantity = supplyQuantities[record.id] || 1;

                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <InputNumber
                          min={1}
                          max={maxQuantity}
                          value={currentQuantity}
                          onChange={(value) => {
                            const newValue = value || 1;
                            if (newValue > maxQuantity) {
                              toast.warning(
                                `⚠️ Số lượng tối đa là ${maxQuantity}!`
                              );
                              handleSupplyQuantityChange(
                                record.id,
                                maxQuantity
                              );
                            } else if (newValue < 1) {
                              handleSupplyQuantityChange(record.id, 1);
                            } else {
                              handleSupplyQuantityChange(record.id, newValue);
                            }
                          }}
                          style={{
                            width: 100,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                          disabled={maxQuantity === 0}
                          controls={true}
                          size="middle"
                          step={1}
                          formatter={(value) =>
                            `${value || 0}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          parser={(value) => {
                            const parsed = value!.replace(/\$\s?|(,*)/g, "");
                            return parsed ? Number(parsed) : 1;
                          }}
                        />
                        <Text
                          type="secondary"
                          style={{ fontSize: 12, minWidth: 40 }}
                        >
                          / {maxQuantity} {record.unit || "cái"}
                        </Text>
                      </div>
                    );
                  },
                  align: "center",
                },
                {
                  title: "Đơn giá",
                  dataIndex: "unit_price",
                  key: "unit_price",
                  width: 120,
                  render: (price: number) => {
                    const formattedPrice = Number(price || 0).toLocaleString(
                      "vi-VN"
                    );
                    return <Text strong>{formattedPrice} ₫</Text>;
                  },
                  align: "right",
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  width: 100,
                  render: (status: string) => (
                    <Tag color={status === "active" ? "green" : "default"}>
                      {status === "active" ? "Hoạt động" : "Ngưng hoạt động"}
                    </Tag>
                  ),
                  align: "center",
                },
              ]}
              dataSource={supplies.map((supply) => ({
                ...supply,
                key: supply.id,
              }))}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Tổng cộng: ${total} vật tư`,
              }}
              rowKey="id"
            />
          ) : null}
        </Spin>
      </Modal>
    </div>
  );
};

export default AddInvoice;
