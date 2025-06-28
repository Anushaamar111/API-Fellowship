# Assets Directory

This directory contains project assets including:

## Screenshots
- `keploy-dashboard.png` - Screenshot of Keploy AI test dashboard showing test results
- `swagger-ui.png` - Screenshot of Swagger UI API documentation
- `github-actions.png` - Screenshot of successful GitHub Actions pipeline

## Instructions for adding screenshots:

1. **Keploy Dashboard Screenshot**:
   - Run your application: `npm start`
   - Install Keploy locally
   - Run: `keploy record -c "node test-api.js"`
   - Run: `keploy test -c "npm start"`
   - Take a screenshot of the test results dashboard
   - Save as `keploy-dashboard.png`

2. **Swagger UI Screenshot**:
   - Run your application: `npm start`
   - Visit: `http://localhost:8000/api-docs`
   - Take a screenshot of the API documentation
   - Save as `swagger-ui.png`

3. **GitHub Actions Screenshot**:
   - Push your code to GitHub
   - Wait for the CI/CD pipeline to complete
   - Take a screenshot of the successful pipeline run
   - Save as `github-actions.png`

## File naming convention:
- Use kebab-case for file names
- Include descriptive names
- Use PNG format for screenshots
- Keep file sizes reasonable (< 2MB)
