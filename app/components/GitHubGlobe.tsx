import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import * as d3 from 'd3';
import { Octokit } from 'octokit';

interface CommitData {
  lat: number;
  lng: number;
  size: number;
  color: string;
  username: string;
  repo: string;
}

const GitHubGlobe = () => {
  const globeRef = useRef<HTMLDivElement>(null);
  const [commits, setCommits] = useState<CommitData[]>([]);
  
  useEffect(() => {
    let globe: any;

    if (globeRef.current) {
      globe = Globe()(globeRef.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundColor('rgba(0,0,0,0)')
        .pointRadius('size')
        .pointColor('color')
        .pointAltitude(0.1)
        .pointLabel((d: CommitData) => `${d.username} committed to ${d.repo}`);

      // Set initial position
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      
      // Set size
      const { width, height } = globeRef.current.getBoundingClientRect();
      globe.width([width]);
      globe.height([height]);
    }

    return () => {
      if (globe) {
        globe.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const fetchCommits = async () => {
      const octokit = new Octokit();
      
      try {
        const response = await octokit.rest.activity.listPublicEvents();
        const pushEvents = response.data
          .filter((event) => event.type === 'PushEvent')
          .map(async (event: any) => {
            // Get user location from GitHub API
            try {
              const userResponse = await octokit.rest.users.getByUsername({
                username: event.actor.login,
              });
              
              if (userResponse.data.location) {
                // Use a geocoding service or hardcoded coordinates for demo
                // Here we're using random coordinates for demonstration
                return {
                  lat: (Math.random() - 0.5) * 180,
                  lng: (Math.random() - 0.5) * 360,
                  size: 0.5 + Math.random(),
                  color: d3.schemeCategory10[Math.floor(Math.random() * 10)],
                  username: event.actor.login,
                  repo: event.repo.name,
                };
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
            return null;
          });

        const commitData = (await Promise.all(pushEvents)).filter(Boolean) as CommitData[];
        setCommits(commitData);
      } catch (error) {
        console.error('Error fetching commits:', error);
      }
    };

    fetchCommits();
    const interval = setInterval(fetchCommits, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const globe = Globe()(globeRef.current);
      globe.pointsData(commits);
    }
  }, [commits]);

  return <div ref={globeRef} style={{ width: '100%', height: '100vh' }} />;
};

export default GitHubGlobe; 