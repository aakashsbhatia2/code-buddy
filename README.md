# code-buddy
An agent that will accept a git repo url, issue description, and raise a PR with the required fixes

### Requirements
- Github Copilot subscription
- Github fine-grained token - Read/ write access to content and PRs, read access to meta data, copilot requests access. Can also scope to repos that you want to use the service for

### Setup
- Create a `.env` based on `.env.example`
- Run server using `npm run dev`
- POST `/issue` with an issue description. The API should invoke the copilot agent which will:
  - Identify the repo that needs to be updated
  - Make code changes
  - Raise a PR
  - Then you can simply pull the branch, test, update and deploy
- Sample curl
  ```
  postman request POST 'localhost:3000/issue' \
  --header 'Content-Type: application/json' \
  --body '{
    "description": "your details issue description here"
  }'
  ```
- You can deploy where you like

### The future
Would like to find a way to keep this free. i.e. use Ollama locally, generate a diff/ patch and raise a PR, instead of being tied to a paid subscription based service
