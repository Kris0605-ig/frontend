# Bước 1: Build dự án bằng Maven
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
# Cấp quyền cho wrapper và build file jar
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Bước 2: Chạy ứng dụng với Java 17
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy file jar từ bước build sang (tên file jar khớp với pom.xml của bạn)
COPY --from=build /app/target/example05-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]