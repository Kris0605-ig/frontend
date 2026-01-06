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
  RaRecord,
  UpdateParams,
  UpdateResult,
} from "react-admin";

const apiUrl = "http://localhost:8080/api";

// -> Interceptor: log server errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      const url = error?.config?.url;
      const method = error?.config?.method;
      const responseBody = error?.response?.data;

      console.error("🚨 AXIOS ERROR:", status, url, method);
      console.error("Response body:", responseBody);

      // Tạm thời KHÔNG xóa token ở đây để tránh bị logout khi đang thử URL tạo sản phẩm
      if (status === 401) {
        console.warn("⚠️ 401 Unauthorized - Hãy kiểm tra quyền ADMIN của tài khoản.");
      }
    } catch (e) {
      console.error('Error in interceptor:', e);
    }
    return Promise.reject(error);
  }
);

const httpClient = {
  get: (url: string) => {
    const token = localStorage.getItem("jwt-token");
    return axios.get(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      withCredentials: true,
    }).then(res => ({ json: res.data }));
  },
  post: (url: string, data: any) => {
    const token = localStorage.getItem("jwt-token");
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      withCredentials: true,
    }).then(res => ({ json: res.data }));
  },
  put: (url: string, data: any) => {
    const token = localStorage.getItem("jwt-token");
    return axios.put(url, data, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      withCredentials: true,
    }).then(res => ({ json: res.data }));
  },
  delete: (url: string) => {
    const token = localStorage.getItem("jwt-token");
    return axios.delete(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      withCredentials: true,
    }).then(res => ({ json: res.data }));
  },
};

const idFieldMapping: Record<string, string> = {
  products: "productId",
  categories: "categoryId",
  carts: "cartId",
  users: "userId",
};

const resourceMap: Record<string, { public: string; admin: string }> = {
  categories: { public: "categories", admin: "categories" },
  products: { public: "products", admin: "products" },
  users: { public: "users", admin: "users" },
  carts: { public: "carts", admin: "carts" },
};

export const dataProvider: DataProvider = {
  getList: async (resource, { pagination = {}, sort = {}, filter = {} }) => {
    const mapped = resourceMap[resource] || { public: resource, admin: resource };
    const { page = 1, perPage = 10 } = pagination;
    const defaultSortField = idFieldMapping[resource] || "id";
    
    // ĐỔI SANG DESC: Để sản phẩm mới nhất hiện lên đầu tiên
    const { field = defaultSortField, order = "DESC" } = sort;

    let finalSortField = field === "id" && resource === "products" ? "productId" : field;

    let url: string;
    if (resource === "carts") {
      url = `${apiUrl}/admin/carts`;
    } else {
      const query = {
        pageNumber: (page - 1).toString(),
        pageSize: perPage.toString(),
        sortBy: finalSortField,
        sortOrder: order,
        ...filter,
      };
      url = `${apiUrl}/public/${mapped.public}?${new URLSearchParams(query).toString()}`;
    }

    const { json } = await httpClient.get(url);
    const content = json.content || json;
    const idField = idFieldMapping[resource] || "id";
    const imageBaseUrl = "http://localhost:8080/images/";

    const data = content.map((item: any) => ({
      ...item,
      id: item[idField], // Đảm bảo luôn có id cho React Admin
      image: item.image ? (item.image.startsWith('http') ? item.image : imageBaseUrl + item.image) : null,
    }));

    return { data, total: json.totalElements || data.length };
  },

  getOne: async (resource, params) => {
    const mapped = resourceMap[resource] || { public: resource, admin: resource };
    const url = `${apiUrl}/public/${mapped.public}/${params.id}`;
    const { json } = await httpClient.get(url);
    const idField = idFieldMapping[resource] || "id";
    
    return { 
      data: { ...json, id: json[idField] } 
    };
  },

  create: async (resource, params) => {
    const mapped = resourceMap[resource] || { admin: resource, public: resource };
    const { data } = params;
    let url = `${apiUrl}/admin/${mapped.admin}`;
    let payload = data;

    if (resource === "products") {
      const categoryId = data.categoryId || data.category?.categoryId;
      const { category, ...rest } = data as any;
      
      // Thử endpoint chính xác của Backend
      url = `${apiUrl}/admin/categories/${categoryId}/product`;
      const { json } = await httpClient.post(url, rest);
      return { data: { ...json, id: json.productId } };
    }

    if (resource === "categories") {
      url = `${apiUrl}/admin/category`;
      payload = { categoryName: data.categoryName };
    }

    const { json } = await httpClient.post(url, payload);
    const idField = idFieldMapping[resource] || "id";
    return { data: { ...json, id: json[idField] } };
  },

  update: async (resource, params) => {
    const idField = idFieldMapping[resource] || "id";
    const url = resource === "products" 
      ? `${apiUrl}/admin/products/${params.id}`
      : `${apiUrl}/admin/categories/${params.id}`;
    
    const { json } = await httpClient.put(url, params.data);
    return { data: { ...json, id: json[idField] || params.id } };
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/admin/${resource === "carts" ? "carts" : resource}/${params.id}`;
    await httpClient.delete(url);
    return { data: params.previousData as any };
  },

  deleteMany: async (resource, params) => {
    await Promise.all(params.ids.map(id => httpClient.delete(`${apiUrl}/admin/${resource}/${id}`)));
    return { data: params.ids };
  },

  getMany: async (resource) => {
    const { json } = await httpClient.get(`${apiUrl}/public/${resource}`);
    const idField = idFieldMapping[resource] || "id";
    const data = (json.content || json).map((item: any) => ({ ...item, id: item[idField] }));
    return { data };
  },

  getManyReference: async () => { throw new Error("Not implemented"); },
  updateMany: async () => { throw new Error("Not implemented"); },
};