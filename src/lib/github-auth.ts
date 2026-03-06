import { readFileSync } from 'fs'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'

export interface GitHubEnv {
  appId: number
  installationId: number
  privateKeyPath: string
  owner: string
  repo: string
}

function getGitHubConfig(): GitHubEnv {
  const appId = process.env.GITHUB_APP_ID
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID
  const privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!appId || !installationId || !privateKeyPath || !owner || !repo) {
    throw new Error('Missing GitHub configuration. Please set GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY_PATH, GITHUB_OWNER, and GITHUB_REPO in your .env.local file.')
  }

  return {
    appId: parseInt(appId),
    installationId: parseInt(installationId),
    privateKeyPath,
    owner,
    repo,
  }
}

let cachedToken: string | null = null
let tokenExpiry: number = 0

export async function getGitHubAuthToken(): Promise<string> {
  const config = getGitHubConfig()

  // Return cached token if still valid (tokens expire after 1 hour)
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  try {
    // Read the private key
    const privateKey = readFileSync(config.privateKeyPath, 'utf8')

    // Create GitHub App authentication
    const auth = createAppAuth({
      appId: config.appId,
      privateKey: privateKey,
      installationId: config.installationId,
    })

    // Get installation token
    const { token } = await auth({ type: 'installation' })

    // Cache the token (expire 5 minutes early to be safe)
    cachedToken = token
    tokenExpiry = Date.now() + (55 * 60 * 1000) // 55 minutes

    return token
  } catch (error) {
    console.error('Error getting GitHub auth token:', error)
    throw error
  }
}

export async function getOctokit(): Promise<Octokit> {
  const token = await getGitHubAuthToken()
  return new Octokit({
    auth: token,
  })
}

export async function fetchGitHubAPI(
  endpoint: string,
  options?: RequestInit,
  owner?: string,
  repo?: string
): Promise<any> {
  const token = await getGitHubAuthToken()
  const config = getGitHubConfig()

  const effectiveOwner = owner || config.owner
  const effectiveRepo = repo || config.repo

  const url = `https://api.github.com/repos/${effectiveOwner}/${effectiveRepo}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.statusText} - ${error}`)
  }

  return response.json()
}

export async function fetchGitHubAPIRoot(endpoint: string, options?: RequestInit): Promise<any> {
  const token = await getGitHubAuthToken()

  const url = `https://api.github.com${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.statusText} - ${error}`)
  }

  return response.json()
}
