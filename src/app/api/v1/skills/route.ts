/**
 * Skills API
 *
 * GET /api/v1/skills - List all available Claude Code CLI skills
 * POST /api/v1/skills/execute - Execute a skill via GitHub Actions
 */

import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface Skill {
  id: string
  name: string
  description: string
  category: string
  file: string
  hasSkillMd: boolean
}

const SKILLS_PATH = join(process.env.HOME || '', '.claude', 'skills')

/**
 * Extract metadata from SKILL.md file
 */
function extractSkillMetadata(skillPath: string): { description: string; category: string } {
  const skillMdPath = join(skillPath, 'SKILL.md')

  if (!existsSync(skillMdPath)) {
    return {
      description: 'No description available',
      category: 'Other'
    }
  }

  try {
    const content = readFileSync(skillMdPath, 'utf-8')
    const lines = content.split('\n')

    let description = ''
    let category = 'Other'

    // Extract YAML frontmatter
    let inFrontmatter = false
    for (const line of lines) {
      if (line.trim() === '---') {
        inFrontmatter = !inFrontmatter
        continue
      }

      if (inFrontmatter) {
        if (line.startsWith('name:')) {
          // Skip name
        } else if (line.startsWith('description:')) {
          description = line.replace(/^description:\s*/, '').trim().replace(/^['"]|['"]$/g, '')
        }
      }
    }

    // Determine category based on skill name/path
    const skillName = skillPath.split('/').pop() || ''

    if (skillName.startsWith('ultra-')) {
      category = 'UltraPilot'
    } else if (['plan', 'review', 'code-review', 'security-review', 'tdd', 'learner'].includes(skillName)) {
      category = 'Development'
    } else if (['pdf', 'docx', 'writer-memory'].includes(skillName)) {
      category = 'Documents'
    } else if (['github', 'mcp-setup', 'configure-notifications'].includes(skillName)) {
      category = 'Integration'
    } else if (['ralph', 'autopilot', 'team', 'pipeline'].includes(skillName)) {
      category = 'Automation'
    } else if (skillName === 'ultrapilot') {
      category = 'Core'
    } else {
      category = 'Other'
    }

    return { description, category }
  } catch (error) {
    console.error(`Error reading SKILL.md for ${skillPath}:`, error)
    return {
      description: 'Error reading skill description',
      category: 'Other'
    }
  }
}

/**
 * GET /api/v1/skills - List all available skills
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!existsSync(SKILLS_PATH)) {
      return NextResponse.json(
        { error: 'Skills directory not found', skills: [] },
        { status: 404 }
      )
    }

    const entries = readdirSync(SKILLS_PATH, { withFileTypes: true })
    const skills: Skill[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const skillPath = join(SKILLS_PATH, entry.name)
      const skillMdPath = join(skillPath, 'SKILL.md')
      const hasSkillMd = existsSync(skillMdPath)

      // Skip hidden directories and non-skill directories
      if (entry.name.startsWith('.') || entry.name === 'learned') {
        continue
      }

      const { description, category: skillCategory } = extractSkillMetadata(skillPath)

      skills.push({
        id: entry.name,
        name: entry.name,
        description,
        category: skillCategory,
        file: skillMdPath,
        hasSkillMd
      })
    }

    // Filter by category if specified
    let filteredSkills = skills
    if (category && category !== 'all') {
      filteredSkills = skills.filter(skill => skill.category === category)
    }

    // Sort by category, then by name
    filteredSkills.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.name.localeCompare(b.name)
    })

    // Get unique categories
    const categories = [...new Set(skills.map(skill => skill.category))].sort()

    return NextResponse.json({
      skills: filteredSkills,
      categories,
      total: skills.length
    })
  } catch (error) {
    console.error('[API] Error in /api/v1/skills:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to list skills',
        skills: [],
        categories: [],
        total: 0
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/v1/skills - Describe available methods
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
    },
  })
}
