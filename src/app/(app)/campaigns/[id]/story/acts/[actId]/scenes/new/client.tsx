'use client';

import SceneForm, { type SceneFormData } from '@/components/forms/SceneForm';
import { useState } from 'react';
import { toast } from 'sonner';
import { createScene } from '../../../../actions';

export default function NewSceneClient({
  actId,
  campaignId,
}: {
  actId: string;
  campaignId: string;
}) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateScene = async (data: SceneFormData) => {
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.content) formData.append('content', data.content);

      await createScene(actId, formData);
      toast.success('Scene created successfully!');
    } catch (error: any) {
      console.error('Error creating scene:', error);
      toast.error(error.message || 'Failed to create scene');
      setIsCreating(false);
    }
  };

  return (
    <SceneForm
      onSubmit={handleCreateScene}
      isLoading={isCreating}
      submitText="Create Scene"
    />
  );
}
