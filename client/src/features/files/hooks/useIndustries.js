import { useQuery } from '@tanstack/react-query';
import { fetchFileIndustries } from '../api/filesApi';

export const useIndustries = (fileId, city) => {
  return useQuery({
    queryKey: ['file', fileId, 'industries', city],
    queryFn: () => fetchFileIndustries(fileId, city),
    enabled: !!fileId,
  });
};
