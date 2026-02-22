import dotenv from "dotenv";
import { CopilotClient } from "@github/copilot-sdk";
dotenv.config({
    path: "../.env"
});

async function main(description) {

    console.log(process.env.GITHUB_TOKEN)
    const client = new CopilotClient({
        githubToken: process.env.GITHUB_TOKEN,
        useLoggedInUser: false
    });

    // Test agent session
    // try {
    //     await client.start();
    //     const session = await client.createSession({
    //         model: "claude-haiku-4.5",
    //     });

    //     console.log("--- Agent is analyzing the two repositories ---");

    //     const response = await session.sendAndWait({
    //         prompt: `
    //         I have two repositories: ${JSON.parse(process.env.TARGET_GH_REPO).join(", ")}.
    //         Issue: "${description}"
            
    //         Protocol:
    //         1. Search both repos using your GitHub tools.
    //         2. Decide which one is broken.
    //         3. Fix the code and open a PR.
    //         4. I have granted you permissions via a fine grained token. It has Read access to metadata,  Read and Write access to code and pull requests, and Read access to models and user copilot requests 
    //         5. If you need additional permissions, ask for them and I will grant them. Tell me exactly what to select in the github UI.
    //         `
    //     }, 300000);

    //     console.log("\n\n\n\n\n\n\n")
    //     console.log("Agent's Decision & Status:", response.data.content);
    //     console.log("\n\n\n\n\n\n\n")
    //     await session.destroy();
    // } catch (error) {
    //     console.error("Error:", error.message);
    // } finally {
    //     await client.stop();
    // }

    // Test SDK
    // try {
    //     await client.start();
    //     const session = await client.createSession({ model: "gpt-5-mini" });

    //     const response = await session.sendAndWait({ prompt: "Hello!" });
    //     console.log(response?.data.content);

    //     await session.destroy();
    // } catch (error) {
    //     console.error("Error:", error.message);
    // } finally {
    //     await client.stop();
    // }


    // Test listing models
    // try {
    //     await client.start();
    //     const resp = await client.listModels();
    //     console.log(resp);
    // } catch(err) {
    //     console.error("Error:", err.message);
    // } finally {
    //     await client.stop();
    // }
}

main("Describe issue here")
    .catch(error => console.error("Unexpected error:", error.message));
