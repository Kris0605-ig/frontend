// 📂 file: component/Cart.tsx
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    Show,
    SimpleShowLayout,
    ArrayField,
    ImageField,
    useRecordContext,
    ReferenceField,
} from "react-admin";
import PDFButton from "./PDFButton";
import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// =============================
// 🔹 Nút xuất PDF (CustomPDFButton)
// =============================
const CustomPDFButton = () => {
    const record = useRecordContext();

    if (!record) return <span>Đang tải dữ liệu...</span>;
    if (!record.id) return <span>Không có Cart ID</span>;

    return (
        <Box sx={{ my: 2 }}>
            <PDFButton cartData={record} />
        </Box>
    );
};

// =============================
// 🛒 Danh sách giỏ hàng (CartList)
// =============================
export const CartList = () => {
    return (
        <List
            title="Danh sách giỏ hàng"
            sx={{
                "& .RaList-content": {
                    bgcolor: "#ffffff",
                    borderRadius: 2,
                    boxShadow: "0px 3px 10px rgba(0,0,0,0.08)",
                    p: 2,
                },
            }}
        >
            <Card sx={{ mb: 2, bgcolor: "primary.main", color: "white", p: 2 }}>
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                    <ShoppingCartIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Quản lý giỏ hàng
                    </Typography>
                </CardContent>
            </Card>

            <Datagrid
                rowClick="show"
                bulkActionButtons={false}
                sx={{
                    "& .RaDatagrid-thead": {
                        bgcolor: "grey.100",
                        fontWeight: "bold",
                    },
                    "& .RaDatagrid-row": {
                        "&:hover": {
                            bgcolor: "grey.50",
                            transition: "0.2s",
                        },
                    },
                    "& .column-cartId": { fontWeight: 600 },
                    "& .column-totalPrice": { color: "primary.main" },
                }}
            >
                <TextField source="cartId" label="🆔 Mã giỏ hàng" />
                <NumberField
                    source="totalPrice"
                    label="💰 Tổng tiền (₫)"
                    options={{
                        style: "currency",
                        currency: "VND",
                        minimumFractionDigits: 0,
                    }}
                />
            </Datagrid>
        </List>
    );
};

// =============================
// 📦 Chi tiết giỏ hàng (CartShow)
// =============================
export const CartShow = () => (
    <Show
        title="Chi tiết giỏ hàng"
        sx={{
            "& .RaShow-content": {
                bgcolor: "#ffffff",
                borderRadius: 2,
                boxShadow: "0px 3px 10px rgba(0,0,0,0.08)",
                p: 3,
            },
        }}
    >
        <SimpleShowLayout>
            <CustomPDFButton />

            <Box sx={{ mb: 2 }}>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, color: "primary.main" }}
                >
                    🛒 Thông tin giỏ hàng
                </Typography>
                <Chip
                    label="Mã giỏ hàng"
                    variant="outlined"
                    sx={{ fontWeight: "bold", mr: 1 }}
                />
                <TextField source="cartId" />
                <Chip
                    label="Tổng tiền"
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: "bold", ml: 2 }}
                />
                <NumberField
                    source="totalPrice"
                    options={{
                        style: "currency",
                        currency: "VND",
                        minimumFractionDigits: 0,
                    }}
                />
            </Box>

            <Typography
                variant="h6"
                sx={{ mt: 3, mb: 1, fontWeight: 600, color: "primary.dark" }}
            >
                📦 Danh sách sản phẩm
            </Typography>

            <ArrayField source="products">
                <Datagrid
                    bulkActionButtons={false}
                    sx={{
                        "& .RaDatagrid-thead": { bgcolor: "grey.100" },
                        "& td": { py: 1.2 },
                    }}
                >
                    <ImageField source="image" label="Ảnh" />
                    <TextField source="productName" label="Tên sản phẩm" />
                    <NumberField source="quantity" label="Số lượng" />
                    <NumberField source="price" label="Giá (₫)" />
                    <NumberField source="discount" label="Giảm giá (%)" />
                    <NumberField source="specialPrice" label="Giá sau giảm (₫)" />
                    <ReferenceField
                        source="category.categoryId"
                        reference="categories"
                        label="Danh mục"
                    >
                        <TextField source="categoryName" />
                    </ReferenceField>
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);
