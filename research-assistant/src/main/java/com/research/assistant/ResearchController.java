package com.research.assistant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/research")
@CrossOrigin(origins = "*")
public class ResearchController {

    private final ResearchService researchService;

    public ResearchController(ResearchService researchService) {
        this.researchService = researchService;
    }

    @PostMapping("/process")
    public String processContent(@RequestBody ResearchRequest request) {
        // This will now trigger the Spring AI ChatClient internally
        return researchService.processContent(request);
    }
}