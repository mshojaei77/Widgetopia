/**
 * GitHub Proxy Utility
 * 
 * This utility fetches real GitHub contribution data using GitHub's GraphQL API with a user token.
 */

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionWeek {
  days: ContributionDay[];
}

interface ContributionData {
  weeks: ContributionWeek[];
  username: string;
}

/**
 * Fetches real GitHub contribution data using GitHub's GraphQL API
 * 
 * This requires a personal access token with appropriate scopes (public_repo is sufficient)
 */
export const fetchGitHubContributions = async (username: string, token: string): Promise<ContributionData> => {
  if (!username) {
    throw new Error('Username is required');
  }
  
  if (!token) {
    throw new Error('GitHub token is required');
  }
  
  try {
    // Fetch contribution data using GitHub's GraphQL API
    const query = `
      query {
        user(login: "${username}") {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
        }
      }
    `;
    
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check for errors in the GraphQL response
    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }
    
    // Check if user data exists
    if (!data.data || !data.data.user) {
      throw new Error(`User ${username} not found`);
    }
    
    // Parse the GraphQL response into our ContributionData format
    const contributionCalendar = data.data.user.contributionsCollection.contributionCalendar;
    const graphqlWeeks = contributionCalendar.weeks;
    
    const weeks: ContributionWeek[] = graphqlWeeks.map((week: any) => {
      const days = week.contributionDays.map((day: any) => {
        // Determine level based on the count
        let level = 0;
        const count = day.contributionCount;
        
        if (count > 0) {
          if (count >= 10) level = 4;
          else if (count >= 5) level = 3;
          else if (count >= 2) level = 2;
          else level = 1;
        }
        
        return {
          date: day.date,
          count: day.contributionCount,
          level
        };
      });
      
      return { days };
    });
    
    return { weeks, username };
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    
    // Rethrow the error with a user-friendly message
    if (error instanceof Error) {
      // Check for common error cases
      if (error.message.includes('Bad credentials')) {
        throw new Error('Invalid GitHub token. Please check your token and try again.');
      } else if (error.message.includes('not found')) {
        throw new Error(`User "${username}" not found on GitHub.`);
      }
      
      throw error;
    }
    
    throw new Error('Failed to fetch GitHub contribution data');
  }
};

/**
 * Helper function to get level from contribution count
 */
export const getContributionLevel = (count: number): number => {
  if (count >= 10) return 4;
  if (count >= 5) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
};

/**
 * GitHub API Notes:
 * 
 * To use the GitHub GraphQL API:
 * 
 * 1. Create a personal access token:
 *    - Go to GitHub Settings > Developer Settings > Personal access tokens
 *    - Generate a new token with the 'repo' or at minimum 'public_repo' scope
 * 
 * 2. The token should be kept secure:
 *    - Never expose it in client-side code
 *    - In production, handle the token server-side
 *    - For personal apps, you can store it in localStorage but be aware of security implications
 *
 * 3. API Limitations:
 *    - The GitHub GraphQL API has rate limits (5,000 points/hour with a token)
 *    - The contributionsCollection query is efficient and counts as a single point
 */ 