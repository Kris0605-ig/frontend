package com.doquockiet.example05.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerConfig {

        @Bean
        public OpenAPI springShopOpenAPI() {
                return new OpenAPI()
                                .components(new Components().addSecuritySchemes("bearerAuth",
                                                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer")
                                                                .bearerFormat("JWT")))
                                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                                .info(new Info().title("E-Commerce Application")
                                                .description("Backend APIs for E-commerce app")
                                                .version("v1.0.0")
                                                .contact(new Contact().name("Do Quoc Kiet")
                                                                .url("https://example.com")
                                                                .email("doquockietfound@gmail.com"))
                                                .license(new License().name("license").url("/")))
                                .externalDocs(new ExternalDocumentation().description("E-Commerce App Documentation")
                                                .url("http://localhost:8080/swagger-ui/index.html"));
        }
}