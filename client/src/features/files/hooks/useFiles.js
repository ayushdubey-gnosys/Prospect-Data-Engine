import { useQuery } from '@tanstack/react-query';
import { fetchFiles } from '../api/filesApi';

export const useFiles = () => {
  return useQuery({ queryKey: ['files'], queryFn: fetchFiles, staleTime: 1000 * 60 * 2 });
};
