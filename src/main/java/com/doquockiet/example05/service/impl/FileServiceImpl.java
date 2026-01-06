package com.doquockiet.example05.service.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.doquockiet.example05.service.FileService;

@Service
public class FileServiceImpl implements FileService {

    @Override
    public String uploadImage(String path, MultipartFile file) throws IOException {
        // ✅ Lấy tên file gốc
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new IOException("Tên file không hợp lệ!");
        }

        // ✅ Tạo tên file ngẫu nhiên tránh trùng
        String randomId = UUID.randomUUID().toString();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String fileName = randomId.concat(fileExtension);

        // ✅ Tạo thư mục nếu chưa có
        File folder = new File(path);
        if (!folder.exists()) {
            folder.mkdirs(); // dùng mkdirs() thay vì mkdir() để tạo nhiều cấp nếu cần
        }

        // ✅ Đường dẫn lưu file
        String filePath = path + File.separator + fileName;

        // ✅ Ghi file, nếu trùng thì ghi đè
        Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    @Override
    public InputStream getResource(String path, String fileName) throws FileNotFoundException {
        String filePath = path + File.separator + fileName;
        File file = new File(filePath);

        // ✅ Kiểm tra file tồn tại
        if (!file.exists()) {
            throw new FileNotFoundException("Không tìm thấy file: " + fileName);
        }

        return new FileInputStream(file);
    }
}
