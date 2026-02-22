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
  - Then you can simply pull the branch, test, fix issues/ finetune and merge!
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
- Manage sessions better. Code changes often require some iterations. Add the ability to interact with a PR. Maybe even work only in a branch till changes are finalized and intentially raise a PR via an API call.
- Add ability to list all available models with usage requirements/ limits. This will give an idea of what different models would cost. Tokens can be expensive and large models may not be needed for smaller tasks.
- Create a simple UI to interact with issues. Make it easier for non-technical people to interact with an application
- Find a way to make this work for free. i.e. use Ollama locally, generate a diff/ patch and raise a PR, instead of being tied to a paid subscription based service
