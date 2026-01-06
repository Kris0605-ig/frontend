import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    buildingName: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser && currentUser.id) {
        try {
          const userProfile = await userService.getUserProfileById(currentUser.id);
          setProfile(userProfile);
          setFormData({
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            mobileNumber: userProfile.mobileNumber || '',
            email: userProfile.email || '',
          });
        } catch (err) {
          setError('Lỗi khi tải hồ sơ: ' + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Người dùng chưa đăng nhập.');
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUserProfile(currentUser.id, formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      alert('✅ Cập nhật thông tin thành công!');
    } catch (err) {
      alert('❌ Không thể cập nhật thông tin.');
    }
  };

  const handleAddressInputChange = (e) => setAddressFormData({ ...addressFormData, [e.target.name]: e.target.value });
  const handleAddAddressClick = () => {
    setEditingAddress(null);
    setAddressFormData({ buildingName: '', street: '', city: '', state: '', pincode: '', country: '' });
    setShowAddressForm(true);
  };

  const handleEditAddressClick = (address) => {
    setEditingAddress(address);
    setAddressFormData(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Xóa địa chỉ này?')) {
      try {
        await userService.deleteAddress(currentUser.id, addressId);
        setProfile({ ...profile, addresses: profile.addresses.filter(addr => addr.addressId !== addressId) });
      } catch {
        alert('❌ Lỗi khi xóa địa chỉ.');
      }
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        const updated = await userService.updateAddress(currentUser.id, editingAddress.addressId, addressFormData);
        setProfile({
          ...profile,
          addresses: profile.addresses.map((a) => (a.addressId === updated.addressId ? updated : a)),
        });
      } else {
        const added = await userService.addAddress(currentUser.id, addressFormData);
        setProfile({ ...profile, addresses: [...(profile.addresses || []), added] });
      }
      setShowAddressForm(false);
    } catch {
      alert('❌ Không thể lưu địa chỉ.');
    }
  };

  if (loading) return <div className="loading">Đang tải thông tin...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-card shadow-sm">
        <h2 className="mb-3">👤 Hồ sơ người dùng</h2>

        {!isEditing ? (
          <>
            <div className="profile-info">
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Họ:</strong> {profile.firstName}</p>
              <p><strong>Tên:</strong> {profile.lastName}</p>
              <p><strong>Số điện thoại:</strong> {profile.mobileNumber}</p>
            </div>
            <button className="btn btn-primary mt-3" onClick={handleEditToggle}>✏️ Chỉnh sửa thông tin</button>
          </>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} disabled />
            </div>
            <div className="form-group">
              <label>Họ</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Tên</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} />
            </div>
            <div className="button-group">
              <button type="submit" className="btn btn-success">💾 Lưu</button>
              <button type="button" className="btn btn-secondary" onClick={handleEditToggle}>Hủy</button>
            </div>
          </form>
        )}
      </div>

      {/* Địa chỉ */}
      <div className="address-section">
        <div className="d-flex justify-between align-center mb-3">
          <h3>🏠 Địa chỉ giao hàng</h3>
          <button className="btn btn-outline-primary" onClick={handleAddAddressClick}>+ Thêm địa chỉ</button>
        </div>

        {profile.addresses && profile.addresses.length > 0 ? (
          <div className="address-list">
            {profile.addresses.map((a) => (
              <div className="address-card" key={a.addressId}>
                <p>{a.buildingName}, {a.street}, {a.city}</p>
                <p>{a.state}, {a.country} ({a.pincode})</p>
                <div className="address-actions">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditAddressClick(a)}>✏️</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAddress(a.addressId)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Chưa có địa chỉ nào.</p>
        )}

        {showAddressForm && (
          <form className="address-form mt-4" onSubmit={handleAddressSubmit}>
            <h4>{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h4>
            {Object.keys(addressFormData).map((key) => (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <input
                  type="text"
                  name={key}
                  value={addressFormData[key]}
                  onChange={handleAddressInputChange}
                />
              </div>
            ))}
            <div className="button-group">
              <button type="submit" className="btn btn-success">💾 Lưu</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddressForm(false)}>Hủy</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
