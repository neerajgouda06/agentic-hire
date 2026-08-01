'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicJobPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        setError('Job not found');
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  if (loading) return <div className="p-8 text-center">Loading job details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="mb-8">
          <CardHeader className="border-b pb-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold mb-2">{job.title}</CardTitle>
                <div className="text-gray-500">Posted on {new Date(job.created_at).toLocaleDateString()}</div>
              </div>
              <Link href={`/jobs/${job._id}/apply`}>
                <Button size="lg">Apply Now</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-3">About the Role</h3>
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {job.description}
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-3">Minimum Experience</h3>
              <p className="text-gray-700">{job.min_experience} years</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </section>

            {job.preferred_skills && job.preferred_skills.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-3">Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.preferred_skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </section>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
