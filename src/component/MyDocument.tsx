import {
  Image,
  Text,
  View,
  Page,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import logo from "./img/logoHiTC.png";

// Đăng ký font Roboto
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "../../../../public/fonts/Roboto-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "../../../../public/fonts/Roboto-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 8, // Giảm font size chung
    paddingTop: 20,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    lineHeight: 1.2,
  },

  // Header Section - Compact
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#6366F1",
  },
  logo: {
    width: 50, // Giảm kích thước logo
    height: 50,
    objectFit: "contain",
  },
  companyInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 10,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1E293B",
    marginBottom: 3,
  },
  companyDetails: {
    fontSize: 7,
    color: "#64748B",
    marginBottom: 2,
  },
  invoiceInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
    backgroundColor: "#6366F1",
    padding: 10,
    borderRadius: 6,
    minWidth: 140,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  invoiceDetail: {
    fontSize: 7,
    color: "#E0E7FF",
    marginBottom: 2,
  },
  invoiceDetailBold: {
    fontSize: 8,
    fontWeight: 600,
    color: "#FFFFFF",
  },

  // Customer Info Section - Compact
  customerSection: {
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1E293B",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#6366F1",
  },
  customerInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#6366F1",
  },
  customerBlock: {
    maxWidth: "48%",
  },
  infoLabel: {
    fontSize: 7,
    color: "#64748B",
    marginBottom: 3,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 9,
    fontWeight: 600,
    color: "#1E293B",
  },

  // Table Section - Compact
  tableContainer: {
    marginTop: 10,
    marginBottom: 12,
  },
  table: {
    display: "table",
    width: "auto",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#6366F1",
  },
  tableColHeader: {
    padding: 8,
    paddingVertical: 6,
  },
  tableCol: {
    padding: 8,
    paddingVertical: 6,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  tableCell: {
    fontSize: 7,
    color: "#475569",
    fontWeight: 400,
  },
  tableCellBold: {
    fontSize: 7,
    fontWeight: 600,
    color: "#1E293B",
  },

  // Column widths - Adjusted for compact
  colNo: { width: "6%" },
  colItem: { width: "38%" },
  colPrice: { width: "15%" },
  colQty: { width: "8%" },
  colDiscount: { width: "10%" },
  colAmount: { width: "13%" },

  // Alignment
  textRight: { textAlign: "right" },
  textCenter: { textAlign: "center" },
  textLeft: { textAlign: "left" },

  // Product name styling - Compact
  productName: {
    fontSize: 8,
    fontWeight: 600,
    color: "#1E293B",
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 6,
    color: "#64748B",
    lineHeight: 1.1,
  },

  // Summary Section - Ultra Compact
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 15,
  },
  summaryLeft: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryRight: {
    width: "48%",
    backgroundColor: "#6366F1",
    padding: 15,
    borderRadius: 6,
    justifyContent: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#64748B",
    fontWeight: 500,
  },
  summaryValue: {
    fontSize: 8,
    fontWeight: 600,
    color: "#475569",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  paymentMethod: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  // Footer - Compact
  footer: {
    marginTop: 15,
    textAlign: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerText: {
    fontSize: 6,
    color: "#94A3B8",
    marginBottom: 2,
  },
  thankYouText: {
    fontSize: 9,
    fontWeight: 700,
    color: "#6366F1",
    marginBottom: 5,
  },

  // Badge styles - Smaller
  discountBadge: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontSize: 6,
    fontWeight: 700,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    marginTop: 2,
    alignSelf: "flex-start",
  },

  // Additional styling for price comparison
  originalPrice: {
    textDecoration: "line-through",
    color: "#94A3B8",
    fontSize: 6,
  },
});

const MyDocument = ({ data }: { data: any }) => {
  if (!data || !data.products || typeof data.totalPrice !== "number") {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>Error: Invalid cart data provided.</Text>
        </Page>
      </Document>
    );
  }

  const { cartId, totalPrice, products } = data;
  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate subtotals
  const subtotal = products.reduce((sum: number, p: any) => 
    sum + (p.specialPrice * p.quantity), 0
  );
  
  const totalDiscount = products.reduce((sum: number, p: any) => 
    sum + ((p.price - p.specialPrice) * p.quantity), 0
  );

  // Format currency function
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN");
  };

  // Shorten product description
  const shortenDescription = (desc: string) => {
    if (!desc) return "";
    return desc.length > 40 ? desc.substring(0, 40) + "..." : desc;
  };

  const InvoiceHeader = () => (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image style={styles.logo} src={logo} />
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>CÔNG TY TNHH ABC</Text>
          <Text style={styles.companyDetails}>📍 123 Đường ABC, Quận 1, TP.HCM</Text>
          <Text style={styles.companyDetails}>📞 (028) 1234 5678</Text>
          <Text style={styles.companyDetails}>✉️ contact@company.com</Text>
        </View>
      </View>
      <View style={styles.invoiceInfo}>
        <Text style={styles.invoiceTitle}>HÓA ĐƠN</Text>
        <Text style={styles.invoiceDetail}>
          Mã: <Text style={styles.invoiceDetailBold}>#{cartId}</Text>
        </Text>
        <Text style={styles.invoiceDetail}>📅 {currentDate}</Text>
        <Text style={styles.invoiceDetail}>🕒 {currentTime}</Text>
      </View>
    </View>
  );

  const CustomerInfo = () => (
    <View style={styles.customerSection}>
      <Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
      <View style={styles.customerInfoContainer}>
        <View style={styles.customerBlock}>
          <Text style={styles.infoLabel}>Tên khách hàng</Text>
          <Text style={styles.infoValue}>
            {localStorage.getItem("username") || "Khách hàng"}
          </Text>
          <Text style={[styles.infoLabel, { marginTop: 4 }]}>Địa chỉ</Text>
          <Text style={styles.infoValue}>123 Đường XYZ, Quận 1, TP.HCM</Text>
        </View>
        <View style={styles.customerBlock}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>
            {localStorage.getItem("email") || "customer@email.com"}
          </Text>
          <Text style={[styles.infoLabel, { marginTop: 4 }]}>Điện thoại</Text>
          <Text style={styles.infoValue}>0901 234 567</Text>
        </View>
      </View>
    </View>
  );

  const ItemsTable = () => (
    <View style={styles.tableContainer}>
      <Text style={styles.sectionTitle}>CHI TIẾT ĐƠN HÀNG</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <View style={[styles.tableColHeader, styles.colNo]}>
            <Text style={[styles.tableCellHeader, styles.textCenter]}>STT</Text>
          </View>
          <View style={[styles.tableColHeader, styles.colItem]}>
            <Text style={styles.tableCellHeader}>Sản phẩm</Text>
          </View>
          <View style={[styles.tableColHeader, styles.colPrice]}>
            <Text style={[styles.tableCellHeader, styles.textRight]}>Đơn giá</Text>
          </View>
          <View style={[styles.tableColHeader, styles.colQty]}>
            <Text style={[styles.tableCellHeader, styles.textCenter]}>SL</Text>
          </View>
          <View style={[styles.tableColHeader, styles.colDiscount]}>
            <Text style={[styles.tableCellHeader, styles.textRight]}>Giảm giá</Text>
          </View>
          <View style={[styles.tableColHeader, styles.colAmount]}>
            <Text style={[styles.tableCellHeader, styles.textRight]}>Thành tiền</Text>
          </View>
        </View>

        {/* Table Body */}
        {products.map((product: any, index: number) => {
          const price = product.price || 0;
          const specialPrice = product.specialPrice || 0;
          const quantity = product.quantity || 0;
          const discount = ((price - specialPrice) / price * 100).toFixed(0);
          const amount = specialPrice * quantity;
          const hasDiscount = price > specialPrice;

          return (
            <View style={styles.tableRow} key={product.id || index}>
              <View style={[styles.tableCol, styles.colNo]}>
                <Text style={[styles.tableCell, styles.textCenter]}>{index + 1}</Text>
              </View>
              <View style={[styles.tableCol, styles.colItem]}>
                <Text style={styles.productName}>{product.productName || "N/A"}</Text>
                {product.description && (
                  <Text style={styles.productDesc}>
                    {shortenDescription(product.description)}
                  </Text>
                )}
                {hasDiscount && (
                  <Text style={styles.discountBadge}>
                    -{discount}%
                  </Text>
                )}
              </View>
              <View style={[styles.tableCol, styles.colPrice]}>
                <Text style={[styles.tableCellBold, styles.textRight]}>
                  {formatCurrency(specialPrice)}đ
                </Text>
                {hasDiscount && (
                  <Text style={[styles.tableCell, styles.textRight, styles.originalPrice]}>
                    {formatCurrency(price)}đ
                  </Text>
                )}
              </View>
              <View style={[styles.tableCol, styles.colQty]}>
                <Text style={[styles.tableCellBold, styles.textCenter]}>{quantity}</Text>
              </View>
              <View style={[styles.tableCol, styles.colDiscount]}>
                <Text style={[styles.tableCell, styles.textRight, { color: "#EF4444", fontWeight: 600 }]}>
                  {hasDiscount ? `-${formatCurrency(price - specialPrice)}đ` : "0đ"}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text style={[styles.tableCellBold, styles.textRight, { color: "#1E293B" }]}>
                  {formatCurrency(amount)}đ
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const InvoiceSummary = () => (
    <View style={styles.summaryContainer}>
      {/* Left side - Detailed breakdown */}
      <View style={styles.summaryLeft}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}đ</Text>
        </View>
        {totalDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá:</Text>
            <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
              -{formatCurrency(totalDiscount)}đ
            </Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
          <Text style={styles.summaryValue}>0đ</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Thuế VAT (0%):</Text>
          <Text style={styles.summaryValue}>0đ</Text>
        </View>
        <View style={styles.paymentMethod}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontSize: 7 }]}>Thanh toán:</Text>
            <Text style={[styles.summaryValue, { color: "#10B981" }]}>Chuyển khoản</Text>
          </View>
        </View>
      </View>

      {/* Right side - Total amount */}
      <View style={styles.summaryRight}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalPrice)}đ</Text>
        </View>
      </View>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer}>
      <Text style={styles.thankYouText}>Trân trọng cảm ơn quý khách!</Text>
      <Text style={styles.footerText}>
        Mọi thắc mắc xin liên hệ: 📞 (028) 1234 5678 | ✉️ support@company.com
      </Text>
      <Text style={styles.footerText}>
        Hóa đơn tự động • Có giá trị như hóa đơn GTGT
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <InvoiceHeader />
        <CustomerInfo />
        <ItemsTable />
        <InvoiceSummary />
        <Footer />
      </Page>
    </Document>
  );
};

export default MyDocument;