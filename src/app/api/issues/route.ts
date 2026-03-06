import { NextResponse } from 'next/server';
import { fetchGitHubAPI } from '@/lib/github-auth';

export async function GET() {
  try {
    const issues = await fetchGitHubAPI('/issues?labels=ultra-task&state=all&per_page=100');

    // Transform issues for dashboard
    const transformedIssues = issues.map((issue: any) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      labels: issue.labels.map((l: any) => l.name),
      assignees: issue.assignees.map((a: any) => a.login),
    }));

    return NextResponse.json({
      success: true,
      data: transformedIssues,
      count: transformedIssues.length,
    });
  } catch (error: any) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack,
    }, { status: 500 });
  }
}
