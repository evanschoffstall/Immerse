'use client';

import CampaignForm, { type CampaignFormData } from '@/components/forms/CampaignForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function NewCampaignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createCampaign = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create campaign');
      }

      return response.json();
    },
    onSuccess: (result) => {
      toast.success('Campaign created successfully!');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      router.push(`/campaigns/${result.campaign.id}`);
    },
    onError: (error: Error) => {
      console.error('Error creating campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Campaign</CardTitle>
          <CardDescription>
            Start your worldbuilding journey by creating a new campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignForm
            onSubmit={async (data) => createCampaign.mutate(data)}
            isLoading={createCampaign.isPending}
            submitText="Create Campaign"
          />
        </CardContent>
      </Card>
    </div>
  );
}
