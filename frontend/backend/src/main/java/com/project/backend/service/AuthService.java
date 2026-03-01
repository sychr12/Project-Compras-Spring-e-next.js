package com.project.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.backend.dto.LoginRequest;
import com.project.backend.dto.LoginResponse;
import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;

import java.util.Base64;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos"));

        if (!request.getPassword().equals(user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }

        String token = Base64.getEncoder().encodeToString(
            (user.getEmail() + ":" + System.currentTimeMillis()).getBytes()
        );

        return new LoginResponse(token, user.getName(), user.getEmail());
    }
}