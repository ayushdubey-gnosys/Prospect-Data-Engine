import { useQuery } from '@tanstack/react-query';
import { fetchFileCities } from '../api/filesApi';

export const useCities = (fileId) => {
  return useQuery({ queryKey: ['file', fileId, 'cities'], queryFn: () => fetchFileCities(fileId), enabled: !!fileId });
};
