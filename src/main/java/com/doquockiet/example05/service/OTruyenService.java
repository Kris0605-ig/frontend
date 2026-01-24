package com.doquockiet.example05.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class OTruyenService {

    private final String BASE_URL = "https://otruyenapi.com/v1/api";
    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked") // Xóa cảnh báo ép kiểu Map
    public Map<String, Object> getMangaDetail(String slug) {
        String url = BASE_URL + "/truyen-tranh/" + slug;
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return null;
        }
    }
}