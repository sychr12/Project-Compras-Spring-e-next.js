package com.compras.auth.controller;

import com.compras.auth.dto.LoginRequest;
import com.compras.auth.dto.LoginResponse;
import com.compras.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller responsavel pelos endpoints de autenticacao.
 * Recebe as requisicoes HTTP e delega a logica para o AuthService.
 * Prefixo de rota: /auth
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    // Injecao de dependencia via construtor
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /auth/login
     * Recebe email e senha do frontend, valida e retorna o token de acesso.
     *
     * Exemplo de requisicao:
     * {
     *   "email": "joao@email.com",
     *   "password": "123456"
     * }
     *
     * Resposta de sucesso (200):
     * {
     *   "token": "uuid-gerado",
     *   "name": "Joao",
     *   "email": "joao@email.com"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
