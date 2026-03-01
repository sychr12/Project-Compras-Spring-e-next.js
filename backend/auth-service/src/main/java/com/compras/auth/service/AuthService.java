package com.compras.auth.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.compras.auth.dto.LoginRequest;
import com.compras.auth.dto.LoginResponse;
import com.compras.auth.entity.User;
import com.compras.auth.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Email ou senha invalidos"));

        if (!request.getPassword().equals(user.getPassword())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Email ou senha invalidos");
        }

        String token = UUID.randomUUID().toString();

        return new LoginResponse(token, user.getName(), user.getEmail());
    }
}