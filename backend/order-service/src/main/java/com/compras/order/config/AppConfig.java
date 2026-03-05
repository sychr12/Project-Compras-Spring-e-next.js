package com.compras.order.config;

import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Configuracao do RestTemplate usando Apache HttpClient.
 * O Java HttpURLConnection padrao nao suporta o metodo HTTP PATCH.
 * O Apache HttpClient resolve esse problema.
 */
@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        HttpClient httpClient = HttpClients.createDefault();
        HttpComponentsClientHttpRequestFactory factory =
            new HttpComponentsClientHttpRequestFactory(httpClient);
        return new RestTemplate(factory);
    }
}