import axios from "axios";
import {
  CreateParams,
  CreateResult,
  DataProvider,
  DeleteManyParams,
  DeleteManyResult,
  DeleteParams,
  DeleteResult,
  GetManyParams,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  Identifier,
  RaRecord, // Thêm Identifier
  UpdateParams,
  UpdateResult,
} from "react-admin";

const apiUrl = "http://localhost:8080/api";

// -> Interceptor: log server errors and handle 401 centrally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      const url = error?.config?.url;
      const method = error?.config?.method;
      const requestData = error?.config?.data;
      const responseBody = error?.response?.data;

      console.error("🚨 AXIOS ERROR INTERCEPTOR -> status:", status, "url:", url, "method:", method);
      console.error("Request payload:", requestData);
      console.error("Response body:", responseBody);

      // Nếu 401 — xóa token để buộc login lại
      if (status === 401) {
        console.warn("⚠️ 401 detected - clearing jwt-token and username from localStorage.");
        localStorage.removeItem("jwt-token");
        localStorage.removeItem("username");
      }

      // nếu gặp /v3/api-docs 500, in thêm thông tin gợi ý
      if (url && url.includes('/v3/api-docs') && status === 500) {
        console.error('❗ Backend returned 500 for /v3/api-docs — check server logs and Springdoc config (springdoc-openapi).');
      }
    } catch (e) {
      console.error('Error in axios interceptor logging:', e);
    }

    return Promise.reject(error);
  },
);

const httpClient = {
  get: (url: string) => {
    const token = localStorage.getItem("jwt-token");
    return axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error("❌ API GET failed:", error);
        throw error;
      });
  },

  post: (url: string, data: any) => {
    const token = localStorage.getItem("jwt-token");
    return axios
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error("❌ API POST failed:", error);
        throw error;
      });
  },

  put: (url: string, data: any) => {
    const token = localStorage.getItem("jwt-token");
    return axios
      .put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error("❌ API PUT failed:", error);
        throw error;
      });
  },

  delete: (url: string) => {
    const token = localStorage.getItem("jwt-token");
    return axios
      .delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => ({ json: response.data }))
      .catch((error) => {
        console.error("❌ API DELETE failed:", error);
        throw error;
      });
  },
};

// ==================================
// 🗂 RESOURCE MAPPING (Đã thêm carts)
// ==================================
const idFieldMapping: Record<string, string> = {
  products: "productId",
  categories: "categoryId",
  carts: "cartId", // Thêm cartId
  users: "userId",
};

const resourceMap: Record<string, { public: string; admin: string }> = {
  categories: { public: "categories", admin: "categories" },
  products: { public: "products", admin: "products" },
  users: { public: "users", admin: "users" },
  carts: { public: "carts", admin: "carts" }, // Thêm carts
};

// ==================================
// 📦 DATA PROVIDER
// ==================================
export const dataProvider: DataProvider = {
  // 🟢 GET LIST (Đã sửa lỗi sắp xếp Products và thêm logic Carts)
  getList: async (
    resource: string,
    { pagination = {}, sort = {}, filter = {} },
  ) => {
    const mapped = resourceMap[resource] || {
      public: resource,
      admin: resource,
    };
    const { page = 1, perPage = 10 } = pagination;

    const defaultSortField = idFieldMapping[resource] || "id";
    const { field = defaultSortField, order = "ASC" } = sort;

    // 🛠️ FIX LỖI 500 CHO PRODUCTS: Buộc sortBy là 'productId' nếu giá trị mặc định là 'id'
    let finalSortField = field;
    if (resource === "products" && field === "id") {
      finalSortField = "productId";
    }

    let url: string;

    // Thêm logic lọc và API endpoint cho carts
    if (resource === "carts") {
      // ✅ Backend CartController trả về List<CartDTO> không có pagination
      // URL: /api/admin/carts (không cần query params)
      url = `${apiUrl}/admin/carts`;
    } else {
      // Bắt đầu với các query params chuẩn
      const initialQuery = {
        pageNumber: (page - 1).toString(),
        pageSize: perPage.toString(),
        sortBy: finalSortField,
        sortOrder: order,
      };

      const query: Record<string, any> = { ...initialQuery, ...filter };
      url = `${apiUrl}/public/${mapped.public}?${new URLSearchParams(query).toString()}`;
    }

    console.log("📡 GET LIST URL:", url);

    const { json } = await httpClient.get(url);
    const idField = idFieldMapping[resource] || "id";
    const imageBaseUrl = "http://localhost:8080/images/";

    const content = json.content || json; // API có thể trả về array trực tiếp hoặc qua content

    const data = content
      ? content.map((item: any) => ({
          id: item[idField],
          ...item,
          image: item.image ? imageBaseUrl + item.image : null,
        }))
      : [];

    return { data, total: json.totalElements || data.length };
  },

  // 🔵 GET ONE (Đã thêm logic Carts)
  getOne: async (
    resource: string,
    params: GetOneParams,
  ): Promise<GetOneResult> => {
    const mapped = resourceMap[resource] || {
      public: resource,
      admin: resource,
    };
    const userEmail = localStorage.getItem("username");
    let url: string;

    if (resource === "carts") {
      // URL: /api/public/users/{email}/carts/{cartId} - Chỉ lấy cart của user hiện tại
      if (!userEmail) throw new Error("⚠️ User not logged in to view cart.");
      url = `${apiUrl}/public/users/${userEmail}/${mapped.public}/${params.id}`;
    } else {
      url = `${apiUrl}/public/${mapped.public}/${params.id}`;
    }

    console.log("📡 GET ONE URL:", url);
    const { json } = await httpClient.get(url);

    const idField = idFieldMapping[resource] || "id";
    const imageBaseUrl = "http://localhost:8080/images/";

    let mappedData: any;

    if (resource === "carts") {
      // Mapping chi tiết cho Cart
      mappedData = {
        id: json[idField], // cartId
        ...json,
        products: json.products.map((product: any) => ({
          id: product.productId,
          productName: product.productName,
          image: product.image ? imageBaseUrl + product.image : null,
          description: product.description,
          quantity: product.quantity,
          price: product.price,
          discount: product.discount,
          specialPrice: product.specialPrice,
          category: product.category
            ? {
                id: product.category.categoryId,
                name: product.category.categoryName,
              }
            : null,
        })),
      };
    } else {
      // Mapping mặc định
      mappedData = {
        id: json[idField],
        ...json,
        image: json.image ? imageBaseUrl + json.image : null,
      };
    }

    return { data: mappedData };
  },

  // 🟢 CREATE (Giữ nguyên logic Product/Category)
  create: async (
    resource: string,
    params: CreateParams,
  ): Promise<CreateResult> => {
    const mapped = resourceMap[resource] || {
      admin: resource,
      public: resource,
    };
    const { data } = params;

    let url = `${apiUrl}/admin/${mapped.admin}`;
    let payload = data;

    if (resource === "products") {
      const categoryId = data.categoryId || data.category?.categoryId;
      if (!categoryId) {
        throw new Error("⚠️ Vui lòng chọn categoryId trước khi tạo sản phẩm.");
      }

      // Chuẩn hoá phần dữ liệu sản phẩm (loại bỏ object category nếu có)
      const { categoryId: _, category, ...rest } = data as Record<string, unknown>;

      const candidateUrls = [
        `${apiUrl}/admin/categories/${categoryId}/product`,
        `${apiUrl}/admin/categories/${categoryId}/products`,
        `${apiUrl}/admin/products`,
      ];

      // Thử nhiều dạng payload phổ biến để tương thích với backend khác nhau
      const candidatePayloads: Array<Record<string, unknown>> = [
        { ...rest, categoryId }, // top-level categoryId
        { ...rest, category: { categoryId } }, // nested category object
        { ...rest, categoryId, category: { categoryId } }, // both
      ];

      let responseJson: Record<string, unknown> | null = null;
      let lastError: unknown = null;
      let usedUrl: string | null = null;
      let usedPayload: Record<string, unknown> | null = null;

      outer: for (const candidate of candidateUrls) {
        for (const payloadAttempt of candidatePayloads) {
          try {
            console.log("📡 TRY CREATE URL:", candidate);
            console.log("📦 TRY PAYLOAD:", payloadAttempt);
            const res = await httpClient.post(candidate, payloadAttempt);
            responseJson = res.json as Record<string, unknown>;
            usedUrl = candidate;
            usedPayload = payloadAttempt;
            break outer;
          } catch (err) {
            lastError = err;
            const message = err instanceof Error ? err.message : String(err);
            console.warn("❗ Create attempt failed for", candidate, message);
            // tiếp tục thử payload khác hoặc endpoint khác
          }
        }
      }

      if (!responseJson) {
        console.error("❌ All create attempts failed:", lastError);
        throw lastError instanceof Error
          ? lastError
          : new Error(String(lastError ?? "❌ Không thể tạo sản phẩm — hãy kiểm tra server."));
      }

      // Chuẩn hoá id trả về để React-Admin có trường `id`
      const id = (responseJson["productId"] ?? responseJson["id"]) as string | number | undefined;
      const respObj: Record<string, unknown> = { ...responseJson, id };
      console.log("📡 CREATE URL SUCCESS:", usedUrl);
      console.log("📦 CREATE USED PAYLOAD:", usedPayload);
      console.log("📦 CREATE RESPONSE:", respObj);
      return { data: respObj as any };
    } else if (resource === "categories") {
      url = `${apiUrl}/admin/category`;
      payload = { categoryName: data.categoryName }; // Thay đổi name thành categoryName
    }

    console.log("📡 CREATE URL:", url);
    console.log("📦 CREATE PAYLOAD:", payload);

    const { json } = await httpClient.post(url, payload);
    const id = json.productId || json.categoryId || json.id;

    json.id = id;
    return { data: json };
  },

  // 🟡 UPDATE (Giữ nguyên logic Product/Category)
  update: async (
    resource: string,
    params: UpdateParams,
  ): Promise<UpdateResult> => {
    const mapped = resourceMap[resource] || {
      admin: resource,
      public: resource,
    };
    const idField = idFieldMapping[resource] || "id";

    // ✅ Nếu là sản phẩm
    if (resource === "products") {
      const { data, previousData } = params;
      const categoryId =
        data.categoryId ||
        previousData?.categoryId ||
        data.category?.categoryId;

      if (!categoryId) {
        throw new Error("⚠️ Thiếu categoryId — không thể cập nhật sản phẩm.");
      }

      // ⚙️ URL chuẩn cho backend: /api/admin/products/{id}
      const realId = params.id ?? data.id ?? data.productId;
      const url = `${apiUrl}/admin/products/${realId}`;

      const payload = {
        productId: realId,
        productName: data.productName,
        description: data.description,
        quantity: data.quantity,
        price: data.price,
        discount: data.discount,
        specialPrice: data.specialPrice,
        image: data.image?.replace("http://localhost:8080/images/", ""), // loại bỏ prefix
        categoryId: categoryId, // Thêm categoryId vào payload
      };

      console.log("📡 UPDATE PRODUCT URL:", url);
      console.log("📦 UPDATE PAYLOAD:", payload);

      const { json } = await httpClient.put(url, payload);

      const fixedJson = {
        ...json,
        id: json[idField] || params.id,
        image: json.image ? `http://localhost:8080/images/${json.image}` : null,
      };

      return { data: fixedJson };
    } else if (resource === "categories") {
      // ✅ Xử lý riêng cho Categories
      const url = `${apiUrl}/admin/categories/${params.id}`;
      const { data } = params;
      const payload = { categoryName: data.categoryName }; // Thay đổi categoryName thành name

      console.log("📡 UPDATE CATEGORY URL:", url);
      console.log("📦 UPDATE CATEGORY PAYLOAD:", payload);

      const { json } = await httpClient.put(url, payload);
      const fixedJson = { ...json, id: json[idField] || params.id };
      return { data: fixedJson };
    }

    // ✅ Mặc định cho resource khác
    const url = `${apiUrl}/admin/${mapped.admin}/${params.id}`;
    const { data } = params;
    const { json } = await httpClient.put(url, data);
    const fixedJson = { ...json, id: json[idField] || params.id };
    return { data: fixedJson };
  },

  // 🔴 DELETE (Đã thêm logic Carts)
  delete: async <RecordType extends RaRecord = any>(
    resource: string,
    params: DeleteParams<RecordType>,
  ): Promise<DeleteResult<RecordType>> => {
    const mapped = resourceMap[resource] || {
      admin: resource,
      public: resource,
    };

    let url: string;
    if (resource === "carts") {
      // URL xóa cart: /api/admin/carts/{id}
      url = `${apiUrl}/admin/carts/${params.id}`;
    } else {
      // URL mặc định: /api/admin/{resource}/{id}
      url = `${apiUrl}/admin/${mapped.admin}/${params.id}`;
    }

    console.log("📡 DELETE URL:", url);

    await httpClient.delete(url);
    return { data: params.previousData as RecordType };
  },

  // 🔴 DELETE MANY (Đã thêm logic Carts)
  deleteMany: async <RecordType extends RaRecord = any>(
    resource: string,
    params: DeleteManyParams,
  ): Promise<DeleteManyResult<RecordType>> => {
    const mapped = resourceMap[resource] || {
      admin: resource,
      public: resource,
    };
    const { ids } = params;

    // Xử lý Carts riêng vì resourceMap không có giá trị admin là 'carts'
    const adminResource = resource === "carts" ? "carts" : mapped.admin;

    await Promise.all(
      ids.map((id) =>
        httpClient.delete(`${apiUrl}/admin/${adminResource}/${id}`),
      ),
    );
    return { data: ids as Identifier[] };
  },

  // 🔵 GET MANY (Giữ nguyên logic)
  getMany: async (
    resource: string,
    _params: GetManyParams,
  ): Promise<GetManyResult> => {
    const mapped = resourceMap[resource] || {
      public: resource,
      admin: resource,
    };
    const { json } = await httpClient.get(`${apiUrl}/public/${mapped.public}`);

    const idField = idFieldMapping[resource] || "id";

    const content = json.content || json;

    const data = content
      ? content.map((item: any) => ({
          id: item[idField],
          ...item,
        }))
      : [];

    return { data };
  },

  // ⚪ CHƯA DÙNG
  getManyReference: async () => {
    throw new Error("Function not implemented.");
  },
  updateMany: async () => {
    throw new Error("Function not implemented.");
  },
};