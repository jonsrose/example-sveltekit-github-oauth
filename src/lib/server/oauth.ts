import { GitHub } from "arctic";
import { BASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";

// TODO: Update redirect URI
export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, `${BASE_URL}/login/github/callback`);
