package com.doquockiet.example05;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.doquockiet.example05.config.AppConstants;
import com.doquockiet.example05.entity.Role;
import com.doquockiet.example05.repository.RoleRepo;
import org.springframework.boot.CommandLineRunner;
import java.util.List;

@SpringBootApplication
public class Example05Application implements CommandLineRunner {

    @Autowired
    RoleRepo roleRepo;

    public static void main(String[] args) {
        SpringApplication.run(Example05Application.class, args);
    }

    // ĐÃ XÓA @Bean ModelMapper Ở ĐÂY - Vì nó đã có ở AppConfig.java

    @Override
    public void run(String... args) throws Exception {
        try {
            Role adminRole = new Role();
            adminRole.setRoleId(AppConstants.ADMIN_ID);
            adminRole.setRoleName("ADMIN");

            Role userRole = new Role();
            userRole.setRoleId(AppConstants.USER_ID);
            userRole.setRoleName("USER");

            List<Role> roles = List.of(adminRole, userRole);
            List<Role> savedRoles = roleRepo.saveAll(roles);

            savedRoles.forEach(System.out::println);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}