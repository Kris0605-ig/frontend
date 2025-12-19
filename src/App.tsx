// file: App.tsx

import { Admin, Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";

// 🧱 Layout & Dashboard
import { Layout } from "./Layout";
import { Dashboard } from "./Dashboard";

// 🔒 Xác thực và kết nối API
import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";

// 🗂️ Các component quản lý dữ liệu
import { CategoryList, CategoryCreate, CategoryEdit } from "./component/Category";
import { ProductList, ProductCreate, ProductEdit } from "./component/Product";
import { CartList, CartShow } from "./component/Cart";
import ProductImageUpdate from "./component/ProductImageUpdate";

// 🎨 Icon
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// 🟢 Sửa lỗi Buffer is not defined (nếu dùng React Admin + Vite)
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

// Simple fallback error page for Admin routes
const AdminErrorPage = () => (
    <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>Đã xảy ra lỗi</h2>
        <p>Ứng dụng không tìm thấy trang yêu cầu hoặc có lỗi nội bộ. Vui lòng kiểm tra Console hoặc liên hệ quản trị.</p>
    </div>
);

// ======================================
// 🚀 MAIN APP
// ======================================
export const App = () => (
    <Admin
        layout={Layout}
        dashboard={Dashboard}
        authProvider={authProvider}
        dataProvider={dataProvider}
        catchAll={AdminErrorPage}
    >
        {/* Custom route riêng cho cập nhật hình ảnh sản phẩm */}
        <CustomRoutes>
            <Route path="/products/:id/update-image" element={<ProductImageUpdate />} />
        </CustomRoutes>

        {/* Quản lý danh mục */}
        <Resource
            name="categories"
            list={CategoryList}
            create={CategoryCreate}
            edit={CategoryEdit}
            icon={CategoryIcon}
        />

        {/* Quản lý sản phẩm */}
        <Resource
            name="products"
            list={ProductList}
            create={ProductCreate}
            edit={ProductEdit}
            icon={Inventory2Icon}
        />

        {/* Quản lý giỏ hàng */}
        <Resource
            name="carts"
            list={CartList}
            show={CartShow}
            icon={ShoppingCartIcon}
        />
    </Admin>
);
