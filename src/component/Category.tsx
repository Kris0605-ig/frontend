import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  Edit,
  useNotify,
  useRedirect,
  required,
} from 'react-admin';

/**
 * Category components for React-Admin
 * - mutationMode="pessimistic" on Edit so the UI waits for server response
 * - id shown as readOnly (included in form values) via inputProps
 */

export const CategoryList: React.FC<any> = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="categoryName" label="Category Name" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const CategoryCreate: React.FC<any> = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Create
      mutationOptions={{
        onSuccess: () => {
          notify('✅ Thêm danh mục thành công', { type: 'info' });
          redirect('list', 'categories');
        },
        onError: (error: any) => {
          notify(`❌ Lỗi khi tạo: ${error?.message ?? JSON.stringify(error)}`, { type: 'error' });
        },
      }}
    >
      <SimpleForm>
        <TextInput source="categoryName" label="Category Name" validate={required()} />
      </SimpleForm>
    </Create>
  );
};

export const CategoryEdit: React.FC<any> = (props) => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Edit
      {...props}
      mutationMode="pessimistic" // <-- chờ server trả về trước khi onSuccess/redirect
      mutationOptions={{
        onSuccess: (_data: any) => {
          notify('✅ Cập nhật danh mục thành công', { type: 'info' });
          redirect('list', 'categories');
        },
        onError: (error: any) => {
          // Hiện error rõ ràng cho người dùng
          const message = error?.message ?? (error?.body ? JSON.stringify(error.body) : JSON.stringify(error));
          notify(`❌ Lỗi khi cập nhật: ${message}`, { type: 'error' });
        },
      }}
    >
      <SimpleForm>
        {/* show id as readOnly so it remains part of form values */}
        <TextInput source="id" label="ID" inputProps={{ readOnly: true }} />
        <TextInput source="categoryName" label="Category Name" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};

export default CategoryList;