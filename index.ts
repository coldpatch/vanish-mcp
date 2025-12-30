#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { VanishClient } from '@vanish-email/client';

const VANISH_BASE_URL = process.env.VANISH_BASE_URL || 'https://api.vanish.host';
const VANISH_API_KEY = process.env.VANISH_API_KEY;

const client = new VanishClient(VANISH_BASE_URL, {
	apiKey: VANISH_API_KEY,
});

// Create server instance
const server = new McpServer({
	name: 'vanish-email',
	version: '0.0.1',
});

// Register Vanish tools

server.registerTool(
	'get-domains',
	{
		title: 'Get Domains',
		description: 'Get list of available email domains',
		inputSchema: {},
	},
	async () => {
		try {
			const domains = await client.getDomains();
			return {
				content: [
					{
						type: 'text',
						text: `Available domains: ${domains.join(', ')}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error fetching domains: ${error}`,
					},
				],
				isError: true,
			};
		}
	},
);

server.registerTool(
	'generate-email',
	{
		title: 'Generate Email',
		description: 'Generate a unique temporary email address',
		inputSchema: {
			domain: z.string().optional().describe('Optional domain to use'),
			prefix: z.string().optional().describe('Optional prefix for the email address'),
		},
	},
	async ({ domain, prefix }: { domain?: string; prefix?: string }) => {
		try {
			const email = await client.generateEmail({ domain, prefix });
			return {
				content: [
					{
						type: 'text',
						text: `Generated email: ${email}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error generating email: ${error}`,
					},
				],
				isError: true,
			};
		}
	},
);

server.registerTool(
	'list-emails',
	{
		title: 'List Emails',
		description: 'List emails for a mailbox address',
		inputSchema: {
			address: z.string().describe('The email address to check'),
			limit: z.number().optional().describe('Maximum number of emails to return'),
			cursor: z.string().optional().describe('Pagination cursor'),
		},
	},
	async ({ address, limit, cursor }: { address: string; limit?: number; cursor?: string }) => {
		try {
			const result = await client.listEmails(address, { limit, cursor });

			if (result.data.length === 0) {
				return {
					content: [
						{
							type: 'text',
							text: `No emails found for ${address}`,
						},
					],
				};
			}

			const formattedEmails = result.data
				.map(
					(email: any) =>
						`ID: ${email.id}\nFrom: ${email.from}\nSubject: ${email.subject}\nPreview: ${email.textPreview}\nReceived: ${email.receivedAt.toISOString()}\nAttachments: ${email.hasAttachments ? 'Yes' : 'No'}\n---`,
				)
				.join('\n');

			return {
				content: [
					{
						type: 'text',
						text: `Emails for ${address} (Total: ${result.total}):\n\n${formattedEmails}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error listing emails: ${error}`,
					},
				],
				isError: true,
			};
		}
	},
);

server.registerTool(
	'get-email',
	{
		title: 'Get Email Details',
		description: 'Get full details of a specific email',
		inputSchema: {
			emailId: z.string().describe('The ID of the email to retrieve'),
		},
	},
	async ({ emailId }: { emailId: string }) => {
		try {
			const email = await client.getEmail(emailId);

			let text = `From: ${email.from}\nTo: ${email.to.join(', ')}\nSubject: ${email.subject}\nReceived: ${email.receivedAt.toISOString()}\n\nContent:\n${email.text}`;

			if (email.attachments.length > 0) {
				text += `\n\nAttachments:\n${email.attachments.map((a: any) => `- ${a.name} (${a.size} bytes, ID: ${a.id})`).join('\n')}`;
			}

			return {
				content: [
					{
						type: 'text',
						text: text,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error getting email: ${error}`,
					},
				],
				isError: true,
			};
		}
	},
);

server.registerTool(
	'delete-email',
	{
		title: 'Delete Email',
		description: 'Delete a specific email',
		inputSchema: {
			emailId: z.string().describe('The ID of the email to delete'),
		},
	},
	async ({ emailId }: { emailId: string }) => {
		try {
			const success = await client.deleteEmail(emailId);
			return {
				content: [
					{
						type: 'text',
						text: success ? `Successfully deleted email ${emailId}` : `Failed to delete email ${emailId}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error deleting email: ${error}`,
					},
				],
				isError: true,
			};
		}
	},
);

server.registerTool(
	'delete-mailbox',
	{
		title: 'Delete Mailbox',
		description: 'Delete all emails in a mailbox',
		inputSchema: {
			address: z.string().describe('The email address of the mailbox to clear'),
		},
	},
	async ({ address }: { address: string }) => {
		try {
			const deletedCount = await client.deleteMailbox(address);
			return {
				content: [
					{
						type: 'text',
						text: `Successfully deleted ${deletedCount} emails from mailbox ${address}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error deleting mailbox: ${error}`,
					},
				],
				isError: true,
			};
		}
	},
);

// Start the server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error('Vanish MCP Server running on stdio');
}

main().catch((error) => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
