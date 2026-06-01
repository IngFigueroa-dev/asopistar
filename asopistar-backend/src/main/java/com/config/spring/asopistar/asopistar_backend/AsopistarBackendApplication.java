package com.config.spring.asopistar.asopistar_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AsopistarBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AsopistarBackendApplication.class, args);
	}

}
