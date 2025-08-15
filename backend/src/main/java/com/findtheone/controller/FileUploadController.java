package com.findtheone.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/photos/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private static final String BASE_URL = "http://localhost:8091"; // Changed from 192.168.1.230 to localhost

    @PostMapping("/photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("Upload request received. File: " +
                    (file != null ? file.getOriginalFilename() : "null") +
                    ", Size: " + (file != null ? file.getSize() : "null"));

            // Validate file
            if (file.isEmpty()) {
                System.out.println("Error: File is empty");
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                System.out.println("Error: File too large. Size: " + file.getSize());
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 10MB"));
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                System.out.println("Error: Filename is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid file"));
            }

            // Check file extension
            String lowercaseFilename = originalFilename.toLowerCase();
            boolean validExtension = false;
            for (String ext : ALLOWED_EXTENSIONS) {
                if (lowercaseFilename.endsWith(ext)) {
                    validExtension = true;
                    break;
                }
            }

            if (!validExtension) {
                System.out.println("Error: Invalid extension for file: " + originalFilename);
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Only image files are allowed (jpg, jpeg, png, gif, webp)"));
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                System.out.println("Creating upload directory: " + uploadPath.toAbsolutePath());
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            System.out.println("Saving file to: " + filePath.toAbsolutePath());

            // Copy file to upload directory
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return the relative file URL (Spring will serve this as static content)
            String fileUrl = "/uploads/photos/" + uniqueFilename;
            System.out.println("File uploaded successfully. URL: " + fileUrl);

            return ResponseEntity.ok(Map.of(
                    "url", fileUrl,
                    "relativePath", fileUrl,
                    "originalName", originalFilename,
                    "size", file.getSize(),
                    "message", "File uploaded successfully"));

        } catch (IOException e) {
            System.err.println("IOException during file upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error during file upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Unexpected error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/photo")
    public ResponseEntity<?> deletePhoto(@RequestParam("url") String photoUrl) {
        try {
            // Only delete files from our uploads directory
            if (!photoUrl.startsWith("/uploads/photos/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid photo URL"));
            }

            String filename = photoUrl.replace("/uploads/photos/", "");
            Path filePath = Paths.get(UPLOAD_DIR, filename);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
            } else {
                return ResponseEntity.ok(Map.of("message", "Photo not found"));
            }

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to delete file: " + e.getMessage()));
        }
    }
}
