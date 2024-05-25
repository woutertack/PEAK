// File path: versusUtils.js

import { supabase } from './supabaseClient';

export const updateChallengeProgress = async (challengeId, userId, newProgress) => {
  // Fetch the current challenge data
  const { data: challenge, error } = await supabase
    .from('versus')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (error) {
    console.error('Error fetching challenge:', error);
    return;
  }

  let updateData = {};

  // Update the progress for the correct user
  if (userId === challenge.creator_id) {
    updateData.creator_progress = newProgress;
  } else if (userId === challenge.friend_id) {
    updateData.friend_progress = newProgress;
  }

  // Determine if someone has won
  if (updateData.creator_progress >= 1 && updateData.creator_progress > challenge.friend_progress) {
    updateData.winner = challenge.creator_id;
  } else if (updateData.friend_progress >= 1 && updateData.friend_progress > challenge.creator_progress) {
    updateData.winner = challenge.friend_id;
  }

  // Update the challenge in Supabase
  const { error: updateError } = await supabase
    .from('versus')
    .update(updateData)
    .eq('id', challengeId);

  if (updateError) {
    console.error('Error updating challenge progress:', updateError);
  } else {
    console.log('Challenge progress updated successfully');
  }
};
