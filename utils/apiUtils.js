import { CopilotClient } from "@github/copilot-sdk";
import { v4 as uuidv4 } from "uuid";
import Ticket from "../models/ticket.js";
import Comment from "../models/comment.js";
import User from "../models/user.js";

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

async function createIssue(title, description) {
    const client = new CopilotClient({
        githubToken: process.env.GITHUB_TOKEN,
        useLoggedInUser: false
    });

    let response = '';
    let session;
    try {
        // Init client
        await client.start();

        // Start a session with the specified model 
        session = await client.createSession({
            model: process.env.MODEL,
        });

        const createIssuePrompt = import("../prompts/createIssuePrompt.js");

        // Prompt agent
        response = await session.sendAndWait({
            prompt: `
            The user has reported an issue. 

            title: "${title}"
            description: "${description}"
            
            The project has the following repositories: ${JSON.parse(process.env.TARGET_GH_REPO).join(", ")}. Search both repos using your GitHub tools to determine where the issue should be categorized.
            
            ${createIssuePrompt}
            `
        }, 300000); // 5 minute timeout for the agent to respond
        console.log("Issue creation response:", response.data.content);
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        if (session) {
            // Destroy session
            await session.destroy();
        }

        // Stop client
        await client.stop();
    }

    // Return agent's response or a default message if no response
    return response?.data?.content || "No response from agent";


}

async function getModelsFromSDK() {
    const client = new CopilotClient({
        githubToken: process.env.GITHUB_TOKEN,
        useLoggedInUser: false
    });

    try {
        await client.start();
        const models = await client.listModels();
        return models;
    } catch (error) {
        console.error("Error fetching models:", error.message);
        throw new Error("Failed to fetch models");
    } finally {
        await client.stop();
    }
}

async function upsertTicket(ticketId, userId, { title, description, status }) {
    try {
        // Build update data
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (status) updateData.status = status;
        
        const result = await Ticket.findOneAndUpdate(
            { id: ticketId, userId },
            { 
                ...updateData,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!result) {
            throw new Error("Ticket not found or you don't have permission to update it");
        }
        
        return result;
    } catch (error) {
        throw new Error(`Failed to update ticket: ${error.message}`);
    }
}

async function addComment(ticketId, userId, content) {
    try {
        if (!content || !content.trim()) {
            throw new Error("Comment content is required");
        }
        
        const id = uuidv4();
        const comment = new Comment({ 
            content, 
            ticketId, 
            userId, 
            id 
        });
        await comment.save();
        
        return comment;
    } catch (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
    }
}

async function getCommentsForTicket(ticketId) {
    try {
        const comments = await Comment.find({ ticketId }).sort({ createdAt: -1 });
        // Fetch user data for each comment
        const commentsWithUser = await Promise.all(
            comments.map(async (comment) => {
                const user = await User.findOne({ id: comment.userId });
                return {
                    ...comment.toObject(),
                    user: user ? { id: user.id, userName: user.userName, email: user.email } : null
                };
            })
        );
        
        return commentsWithUser;
    } catch (error) {
        throw new Error(`Failed to retrieve comments: ${error.message}`);
    }
}

export { resolveIssue, getModelsFromSDK, upsertTicket, addComment, getCommentsForTicket, createIssue };
