import { CopilotClient } from "@github/copilot-sdk";

async function resolveIssue(description) {
    const client = new CopilotClient({
        githubToken: process.env.GITHUB_TOKEN,
        useLoggedInUser: false
    });

    let response = '';
    try {
        // Init client
        await client.start();

        // Start a session with the specified model 
        const session = await client.createSession({
            model: process.env.MODEL,
        });

        // Prompt agent
        response = await session.sendAndWait({
            prompt: `
            I have two repositories: ${JSON.parse(process.env.TARGET_GH_REPO).join(", ")}.
            Issue: "${description}"
            
            Protocol:
            1. Search both repos using your GitHub tools.
            2. Decide where the changes need to be made.
            3. Update the code.
            4. Verify that you have not made any syntax errors.
            5. Verify that all the requirements stated by the user have been addressed.
            6. Verify there is no dead code or duplicate code.
            7. Raise a PR. 
            8. I have granted you permissions via a fine grained token. If you need additional permissions, ask for them and I will grant them. Tell me exactly what to select in the github UI.
            9. In your response, include a link to the PR you raised, a summary of the changes you made and why you made these changes.
            `
        }, 300000); // 5 minute timeout for the agent to respond
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        // Destroy session
        await session.destroy();

        // Stop client
        await client.stop();
    }

    // Return agent's response or a default message if no response
    return response?.data?.content || "No response from agent";
}

export { resolveIssue };
