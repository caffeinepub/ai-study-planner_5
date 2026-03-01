# AI Study Planner

## Current State
The app has a working UI with Concepts/Notes/Quiz/Planner tabs. The backend uses HTTP outcalls to Anthropic's API with a hardcoded placeholder API key (`YOUR_OPENAI_API_KEY`), causing `authentication_error: invalid x-api-key` for all content generation requests. The frontend receives raw JSON error strings and displays them as-is in the content panels.

## Requested Changes (Diff)

### Add
- On-chain content generation functions in the backend that produce rich, structured study content without any external API calls
- Topic-aware content generation using keyword matching and structured templates
- Proper error-free content for all four tabs: Concepts, Notes, Quiz, Planner

### Modify
- Replace `makeOpenAIRequest` and all HTTP outcall logic with pure Motoko content generation functions
- Remove all external API dependencies (http-outcalls component no longer needed)
- Backend `generateStudyContent` function now calls local generators instead of remote APIs
- Remove `transform` function and related HTTP outcall types since they are no longer needed
- Update `backend.d.ts` to remove `transform`, `TransformationInput`, `TransformationOutput`, `http_header`, `http_request_result` types

### Remove
- All HTTP outcall imports and usage
- External API key references
- `transform` query function

## Implementation Plan
1. Rewrite `main.mo` with on-chain generators for concepts, notes, quiz, and study planner
2. Generate rich structured Markdown content using topic name + difficulty + days as inputs
3. Update `backend.d.ts` to match new interface (remove transform/http types)
4. Verify frontend pages parse and render Markdown content correctly
