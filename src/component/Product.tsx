import React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  EditButton,
  DeleteButton,
  ReferenceField,
  useRecordContext,
  useRedirect,
  Button,
  useNotify,
  ChipField, // Thêm ChipField vào import
} from "react-admin";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Stack,
  Divider,
  Grid,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

// Hiển thị hình ảnh với link đến trang cập nhật
const CustomImageField = ({ source }: { source: string }) => {
  const record = useRecordContext();
  if (!record || !record[source]) return (
    <Chip
      label="Chưa có ảnh"
      variant="outlined"
      size="small"
      color="default"
    />
  );

  const id = record.id || record.productId;
  return (
    <Link
      to={`/products/${id}/update-image`}
      style={{ display: "inline-block", textDecoration: "none" }}
      onClick={(e) => e.stopPropagation()}
    >
      <Box
        sx={{
          position: "relative",
          width: 80,
          height: 80,
          borderRadius: 2,
          overflow: "hidden",
          border: "2px solid",
          borderColor: "primary.main",
          "&:hover": {
            borderColor: "primary.dark",
            "&::after": {
            //   content: '"📷"',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
            }
          }
        }}
      >
        <img
          src={record[source]}
          alt="Sản phẩm"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
    </Link>
  );
};

// Nút chỉnh sửa ảnh
const UpdateImageButton = () => {
  const record = useRecordContext();
  const redirect = useRedirect();
  if (!record) return null;

  return (
    <Button
      onClick={() => redirect(`/products/${record.id}/update-image`)}
      label="Cập nhật ảnh"
      sx={{
        color: "primary.main",
        border: "1px solid",
        borderColor: "primary.main",
        "&:hover": {
          backgroundColor: "primary.main",
          color: "white",
        },
      }}
    />
  );
};

// Bộ lọc
const postFilters = [
  <TextInput
    source="search"
    label="Tìm kiếm"
    alwaysOn
    key="search"
    sx={{ mb: 2 }}
  />,
  <ReferenceInput
    source="categoryId"
    reference="categories"
    label="Danh mục"
    key="category"
  >
    <SelectInput optionText="categoryName" />
  </ReferenceInput>,
];

// Custom Title Component
const ProductTitle = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
    {icon}
    <Typography variant="h4" fontWeight="bold" sx={{ ml: 1 }}>
      {title}
    </Typography>
  </Box>
);

// Danh sách sản phẩm
export const ProductList = () => (
  <List
    filters={postFilters}
    title="Quản lý Sản phẩm"
    sx={{
      mt: 2,
      "& .RaList-content": {
        boxShadow: "none",
      }
    }}
  >
    <Datagrid
      rowClick="edit"
      sx={{
        "& .RaDatagrid-headerCell": {
          backgroundColor: "primary.main",
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
        },
        "& .column-productId": {
          fontWeight: "bold",
          color: "primary.main",
        },
        "& .column-productName": {
          fontWeight: "bold",
        },
        "& .column-specialPrice": {
          color: "success.main",
          fontWeight: "bold",
        },
        "& .column-price": {
          color: "text.secondary",
        },
        "& .column-discount": {
          color: "error.main",
          fontWeight: "bold",
        },
        "& .RaDatagrid-row": {
          "&:hover": {
            backgroundColor: "action.hover",
          },
        },
      }}
    >
      <TextField source="productId" label="ID" />
      <TextField source="productName" label="Tên sản phẩm" />
      <ReferenceField
        label="Danh mục"
        source="categoryId"
        reference="categories"
        link={false}
      >
        <ChipField source="categoryName" size="small" /> {/* Sửa lỗi ở đây */}
      </ReferenceField>
      <CustomImageField source="image" label="Ảnh" />
      <TextField
        source="description"
        label="Mô tả"
        sx={{
          maxWidth: 200,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      />
      <NumberField source="quantity" label="Số lượng" />
      <NumberField
        source="price"
        label="Giá"
        options={{ style: "currency", currency: "VND" }}
      />
      <NumberField source="discount" label="Giảm giá (%)" />
      <NumberField
        source="specialPrice"
        label="Giá khuyến mãi"
        options={{ style: "currency", currency: "VND" }}
      />
      <EditButton
        label="Sửa"
        sx={{
          color: "primary.main",
          "&:hover": {
            backgroundColor: "primary.light",
            color: "white",
          },
        }}
      />
      <DeleteButton
        label="Xóa"
        sx={{
          color: "error.main",
          "&:hover": {
            backgroundColor: "error.light",
            color: "white",
          },
        }}
      />
    </Datagrid>
  </List>
);

// Tạo mới sản phẩm
export const ProductCreate = () => {
  const notify = useNotify();

  return (
    <Create
      title={<ProductTitle title="Thêm sản phẩm mới" icon={<AddIcon color="primary" />} />}
      transform={(data) => {
        if (data.price && data.discount !== undefined) {
          data.specialPrice = data.price * (1 - data.discount / 100);
        }
        return data;
      }}
      redirect={(basePath, id) => `/products/${id}/update-image`}
      mutationOptions={{
        onSuccess: () => {
          notify("✅ Tạo sản phẩm thành công! Hãy cập nhật ảnh sản phẩm.", {
            type: "success",
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          });
        },
      }}
      sx={{
        "& .RaCreate-card": {
          boxShadow: 3,
          borderRadius: 2,
        }
      }}
    >
      <SimpleForm
        sx={{
          "& .RaSimpleForm-form": {
            maxWidth: 800,
            margin: "0 auto",
          }
        }}
      >
        <Card sx={{ p: 3, boxShadow: 2 }}>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Thông tin sản phẩm
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextInput
                    source="productName"
                    label="Tên sản phẩm"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ReferenceInput
                    source="categoryId"
                    reference="categories"
                    label="Danh mục"
                    fullWidth
                  >
                    <SelectInput
                      optionText="categoryName"
                      sx={{ width: "100%" }}
                    />
                  </ReferenceInput>
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    source="description"
                    label="Mô tả"
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <NumberInput
                    source="quantity"
                    label="Số lượng"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <NumberInput
                    source="price"
                    label="Giá"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <NumberInput
                    source="discount"
                    label="Giảm giá (%)"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      </SimpleForm>
    </Create>
  );
};

// Chỉnh sửa sản phẩm
export const ProductEdit = () => {
  const ProductEditTitle = () => {
    const record = useRecordContext();
    return (
      <ProductTitle
        title={`Chỉnh sửa: ${record?.productName || ''}`}
        icon={<EditIcon color="primary" />}
      />
    );
  };

  return (
    <Edit
      title={<ProductEditTitle />}
      transform={(data) => {
        if (data.price && data.discount !== undefined) {
          data.specialPrice = data.price * (1 - data.discount / 100);
        }
        return data;
      }}
      sx={{
        "& .RaEdit-card": {
          boxShadow: 3,
          borderRadius: 2,
        }
      }}
    >
      <SimpleForm
        sx={{
          "& .RaSimpleForm-form": {
            maxWidth: 800,
            margin: "0 auto",
          }
        }}
      >
        <Card sx={{ p: 3, boxShadow: 2 }}>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  Thông tin sản phẩm
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextInput
                    source="productId"
                    disabled
                    label="ID sản phẩm"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput
                    source="productName"
                    label="Tên sản phẩm"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ReferenceInput
                    source="categoryId"
                    reference="categories"
                    label="Danh mục"
                    fullWidth
                  >
                    <SelectInput
                      optionText="categoryName"
                      sx={{ width: "100%" }}
                    />
                  </ReferenceInput>
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    source="description"
                    label="Mô tả"
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <NumberInput
                    source="quantity"
                    label="Số lượng"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <NumberInput
                    source="price"
                    label="Giá"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <NumberInput
                    source="discount"
                    label="Giảm giá (%)"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <UpdateImageButton />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      </SimpleForm>
    </Edit>
  );
};