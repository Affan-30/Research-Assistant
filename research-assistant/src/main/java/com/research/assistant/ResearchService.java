
package com.research.assistant;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
        import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ResearchService {

    @Value("${openrouter.api.url}")
    private String openRouterUrl;

    @Value("${openrouter.api.key}")
    private String openRouterApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ResearchService(RestTemplate restTemplate,
                           ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String processContent(ResearchRequest request) {

        String prompt = buildPrompt(request);

        // ---- OpenRouter Request Body ----
        Map<String, Object> body = Map.of(
                "model", "mistralai/devstral-2512:free",
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        );

        // ---- Headers ----
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openRouterApiKey);
        headers.set("HTTP-Referer", "http://localhost"); // required by OpenRouter
        headers.set("X-Title", "Research Assistant");

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            openRouterUrl,
                            entity,
                            String.class
                    );

            return extractText(response.getBody());

        } catch (Exception e) {
            return "Error calling OpenRouter: " + e.getMessage();
        }
    }

    // ---- Extract assistant text safely ----
    private String extractText(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            return root
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText("No response generated");
        } catch (Exception e) {
            return "Error parsing OpenRouter response";
        }
    }

    private String buildPrompt(ResearchRequest request) {
        return switch (request.getOperation()) {
            case "summarize" ->
                    "Provide a clear and concise summary of the following text in a few sentences:\n\n" + request.getContent();
            case "suggest" ->
                    "Based on the following content: suggest related topics and further reading. Format the response with clear headings and bullet points:\n\n" + request.getContent();
            default ->
                    throw new IllegalArgumentException("Invalid operation");
        };
    }
}

