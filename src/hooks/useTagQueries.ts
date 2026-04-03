import { useQuery } from '@tanstack/react-query';
import { getTags } from '../api/tagService';

export function useTagsQuery() {
  return useQuery({
    queryKey: ['tags', 'list'],
    queryFn: getTags,
  });
}
